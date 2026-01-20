import express from 'express'
import bus, { EVENTS } from '../events/bus.js'
import { query, getConnection } from '../db.js'
import { logSystem } from '../services/logger.js'
import { createMessage } from '../services/messages.js'

const router = express.Router()

function getUserFromCookies(req) {
  const uid = req.signedCookies?.uid || req.cookies?.uid
  const role = req.signedCookies?.role || req.cookies?.role
  return { uid: uid ? Number(uid) : null, role }
}

function formatInviteDateParts(dateObj) {
  const pad = (val) => String(val).padStart(2, '0')
  return {
    dateStr: `${pad(dateObj.getDate())}-${pad(dateObj.getMonth() + 1)}-${dateObj.getFullYear()}`,
    timeStr: `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}`,
  }
}

function normalizeDecision(value) {
  const raw = String(value || '').toLowerCase()
  if (raw === 'accept' || raw === 'accepted' || raw === 'accepteer') return 'accept'
  if (raw === 'decline' || raw === 'rejected' || raw === 'weigeren' || raw === 'weiger') return 'decline'
  return null
}

// Nieuwe sollicitatie indienen
router.post('/', async (req, res) => {
  let conn = null
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid || role !== 'seeker') {
      return res.status(401).json({ error: 'Niet ingelogd als werknemer' })
    }

    const vacancyId = Number(req.body?.vacancy_id || req.body?.vacature_id)
    const motivatie = (req.body?.motivatie || '').toString().trim() || null

    if (!vacancyId || Number.isNaN(vacancyId)) {
      return res.status(400).json({ error: 'vacancy_id ontbreekt of is ongeldig' })
    }

    // Controleer vacature en employer
    const vacancyRows = await query(
      'SELECT id, employer_id, functietitel, is_active FROM vacancies WHERE id = ? LIMIT 1',
      [vacancyId]
    )
    const vacancy = vacancyRows[0]
    if (!vacancy) return res.status(404).json({ error: 'Vacature niet gevonden' })
    if (vacancy.is_active === 0) return res.status(400).json({ error: 'Vacature is niet actief' })
    const employerId = vacancy.employer_id
    if (!employerId) return res.status(400).json({ error: 'Vacature heeft geen werkgever gekoppeld' })

    // Duplicate preventie
    const dup = await query(
      'SELECT id FROM sollicitaties WHERE werknemer_id = ? AND vacature_id = ? LIMIT 1',
      [uid, vacancyId]
    )
    if (dup.length) {
      return res.status(409).json({ error: 'Je hebt al gesolliciteerd op deze vacature', sollicitatie_id: dup[0].id })
    }

    conn = await getConnection()
    await conn.beginTransaction()
    const [result] = await conn.execute(
      `INSERT INTO sollicitaties (werknemer_id, werkgever_id, vacature_id, motivatie, status)
       VALUES (?,?,?,?,?)`,
      [uid, employerId, vacancyId, motivatie, 'ingediend']
    )
    const sollicitatieId = result.insertId
    await conn.commit()

    // Zorg dat thread bestaat (dossier)
    try {
      await query(
        `INSERT INTO sollicitatie_threads (sollicitatie_id) VALUES (?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [sollicitatieId]
      )
    } catch (err) {
      await logSystem('sollicitatie_thread_error', 'error', 'Thread kon niet worden aangemaakt', { sollicitatieId, err: err?.message })
    }

    bus.emit(EVENTS.SOLLICITATIE_NIEUW, { sollicitatieId })
    await logSystem('sollicitatie_created', 'info', 'Nieuwe sollicitatie opgeslagen', {
      sollicitatieId,
      werknemer_id: uid,
      werkgever_id: employerId,
      vacancy_id: vacancyId,
    })

    return res.status(201).json({ id: sollicitatieId, message: 'sollicitatie_ingediend' })
  } catch (err) {
    if (conn) {
      try { await conn.rollback() } catch {}
    }
    await logSystem('sollicitatie_error', 'error', 'Fout bij opslaan sollicitatie', { error: err?.message })
    console.error('POST /api/sollicitaties error:', err)
    return res.status(500).json({ error: 'Kon sollicitatie niet opslaan' })
  } finally {
    if (conn) conn.release?.()
  }
})

// Werkgever nodigt kandidaat uit voor vacature
router.post('/invite', async (req, res) => {
  let conn = null
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid || role !== 'employer') {
      return res.status(401).json({ error: 'Niet ingelogd als werkgever' })
    }

    const vacancyId = Number(req.body?.vacancy_id || req.body?.vacature_id)
    const candidateId = Number(req.body?.candidate_id || req.body?.werknemer_id || req.body?.seeker_id)
    const customMessage = (req.body?.message || req.body?.body || '').toString().trim()

    if (!vacancyId || Number.isNaN(vacancyId)) {
      return res.status(400).json({ error: 'vacancy_id ontbreekt of is ongeldig' })
    }
    if (!candidateId || Number.isNaN(candidateId)) {
      return res.status(400).json({ error: 'candidate_id ontbreekt of is ongeldig' })
    }

    const vacancyRows = await query(
      `SELECT v.id, v.employer_id, v.functietitel, v.is_active,
              u.naam AS werkgever_naam, u.bedrijfsnaam AS werkgever_bedrijfsnaam
       FROM vacancies v
       JOIN users u ON u.id = v.employer_id
       WHERE v.id = ?
       LIMIT 1`,
      [vacancyId]
    )
    const vacancy = vacancyRows[0]
    if (!vacancy) return res.status(404).json({ error: 'Vacature niet gevonden' })
    if (vacancy.employer_id !== uid) return res.status(403).json({ error: 'Geen toegang tot deze vacature' })
    if (vacancy.is_active === 0) return res.status(400).json({ error: 'Vacature is niet actief' })

    const candidateRows = await query(
      'SELECT id, role, naam, email FROM users WHERE id = ? LIMIT 1',
      [candidateId]
    )
    const candidate = candidateRows[0]
    if (!candidate) return res.status(404).json({ error: 'Kandidaat niet gevonden' })
    if (candidate.role !== 'seeker') return res.status(400).json({ error: 'Gebruiker is geen kandidaat' })

    const existing = await query(
      'SELECT id, status FROM sollicitaties WHERE werknemer_id = ? AND vacature_id = ? LIMIT 1',
      [candidateId, vacancyId]
    )
    if (existing.length) {
      const status = existing[0].status
      const message = status === 'uitnodiging'
        ? 'Deze kandidaat is al uitgenodigd voor deze vacature'
        : 'Deze kandidaat heeft al gesolliciteerd op deze vacature'
      return res.status(409).json({ error: message, sollicitatie_id: existing[0].id })
    }

    const werkgeverNaam = vacancy.werkgever_bedrijfsnaam || vacancy.werkgever_naam || 'Werkgever'
    const vacatureTitel = vacancy.functietitel || 'Vacature'
    const now = new Date()
    const { dateStr, timeStr } = formatInviteDateParts(now)
    const defaultLine = 'Je bent uitgenodigd om te reageren op deze vacature.'
    const messageBody = [
      `Je bent uitgenodigd door ${werkgeverNaam} voor de functie ${vacatureTitel}.`,
      '',
      `Datum: ${dateStr}`,
      `Tijd: ${timeStr}`,
      '',
      customMessage ? `Bericht: ${customMessage}` : defaultLine,
      '',
      'Bekijk de vacature in Starwa om direct te reageren.',
    ].join('\n')

    conn = await getConnection()
    await conn.beginTransaction()
    const [solResult] = await conn.execute(
      `INSERT INTO sollicitaties (werknemer_id, werkgever_id, vacature_id, motivatie, status)
       VALUES (?,?,?,?,?)`,
      [candidateId, uid, vacancyId, null, 'uitnodiging']
    )
    const sollicitatieId = solResult.insertId
    const [threadResult] = await conn.execute(
      `INSERT INTO sollicitatie_threads (sollicitatie_id) VALUES (?)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
      [sollicitatieId]
    )
    const threadId = threadResult.insertId
    const [threadMsgResult] = await conn.execute(
      `INSERT INTO sollicitatie_thread_messages (thread_id, sender_user_id, receiver_user_id, type, body)
       VALUES (?,?,?,?,?)`,
      [threadId, uid, candidateId, 'invite', messageBody]
    )
    const metadata = {
      vacature_id: vacancyId,
      vacature_titel: vacatureTitel,
      sollicitatie_id: sollicitatieId,
      werknemer_id: candidateId,
      werkgever_id: uid,
      werkgever_naam: werkgeverNaam,
      created_at: now.toISOString(),
      thread_id: threadId,
      thread_message_id: threadMsgResult.insertId,
      link: `/match?vacature=${vacancyId}`,
      date: dateStr,
      time: timeStr,
      from_role: role,
      message_type: 'invite',
    }
    const metaString = JSON.stringify(metadata)
    const [msgResult] = await conn.execute(
      `INSERT INTO messages (receiver_user_id, sender_user_id, title, body, type, related_id, metadata)
       VALUES (?,?,?,?,?,?,?)`,
      [
        candidateId,
        uid,
        `Uitnodiging voor vacature: ${vacatureTitel}`,
        messageBody,
        'invite',
        sollicitatieId,
        metaString,
      ]
    )
    await conn.commit()

    await logSystem('sollicitatie_invite', 'info', 'Kandidaat uitgenodigd', {
      sollicitatie_id: sollicitatieId,
      vacature_id: vacancyId,
      werknemer_id: candidateId,
      werkgever_id: uid,
      message_id: msgResult.insertId,
    })

    return res.status(201).json({ id: sollicitatieId, message: 'uitnodiging_verzonden', thread_id: threadId })
  } catch (err) {
    if (conn) {
      try { await conn.rollback() } catch {}
    }
    if (err?.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Deze kandidaat is al uitgenodigd of heeft al gesolliciteerd op deze vacature' })
    }
    await logSystem('sollicitatie_invite_error', 'error', 'Fout bij uitnodigen kandidaat', { error: err?.message })
    console.error('POST /api/sollicitaties/invite error:', err)
    return res.status(500).json({ error: 'Kon uitnodiging niet versturen' })
  } finally {
    if (conn) conn.release?.()
  }
})

// Helper: load sollicitatie + parties
async function loadSollicitatieWithUsers(id) {
  const rows = await query(
    `SELECT s.*, u1.role AS werknemer_role, u2.role AS werkgever_role,
            u1.email AS werknemer_email, u1.naam AS werknemer_naam,
            u2.email AS werkgever_email, u2.naam AS werkgever_naam,
            v.functietitel AS vacature_titel,
            st.archived AS thread_archived
     FROM sollicitaties s
     JOIN users u1 ON u1.id = s.werknemer_id
     JOIN users u2 ON u2.id = s.werkgever_id
     JOIN vacancies v ON v.id = s.vacature_id
     LEFT JOIN sollicitatie_threads st ON st.sollicitatie_id = s.id
     WHERE s.id = ?
     LIMIT 1`,
    [id]
  )
  return rows[0]
}

async function ensureThread(sollicitatieId) {
  const rows = await query(
    `INSERT INTO sollicitatie_threads (sollicitatie_id)
     VALUES (?)
     ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
    [sollicitatieId]
  )
  return rows.insertId || (await query('SELECT id FROM sollicitatie_threads WHERE sollicitatie_id = ? LIMIT 1', [sollicitatieId]))[0]?.id
}

// Haal dossier/gesprek op
router.get('/:id/thread', async (req, res) => {
  try {
    const { uid } = getUserFromCookies(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })
    const id = Number(req.params.id)
    const sol = await loadSollicitatieWithUsers(id)
    if (!sol) return res.status(404).json({ error: 'Niet gevonden' })
    if (sol.werknemer_id !== uid && sol.werkgever_id !== uid) return res.status(403).json({ error: 'Geen toegang' })
    const threadId = await ensureThread(id)
    const messages = await query(
      `SELECT stm.*,
              COALESCE(NULLIF(u.bedrijfsnaam, ''), NULLIF(u.contactpersoon, ''), NULLIF(u.naam, ''), u.email) AS sender_name,
              u.role AS sender_role
       FROM sollicitatie_thread_messages stm
       JOIN users u ON u.id = stm.sender_user_id
       WHERE stm.thread_id = ?
       ORDER BY stm.created_at ASC`,
      [threadId]
    )
    return res.json({
      thread: {
        id: threadId,
        archived: !!sol.thread_archived,
        sollicitatie_id: id,
      },
      items: messages.map(m => ({
        id: m.id,
        type: m.type,
        body: m.body,
        sender_user_id: m.sender_user_id,
        receiver_user_id: m.receiver_user_id,
        sender_name: m.sender_name,
        sender_role: m.sender_role,
        created_at: m.created_at,
      })),
    })
  } catch (err) {
    console.error('GET /api/sollicitaties/:id/thread error:', err)
    return res.status(500).json({ error: 'Kon dossier niet laden' })
  }
})

// Werkgever/werknemer reageert met info of uitnodiging
router.post('/:id/react', async (req, res) => {
  let conn = null
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })
    const id = Number(req.params.id)
    const { body: messageBody, type = 'info' } = req.body || {}
    if (!messageBody || !messageBody.trim()) return res.status(400).json({ error: 'Bericht mag niet leeg zijn' })
    const sol = await loadSollicitatieWithUsers(id)
    if (!sol) return res.status(404).json({ error: 'Niet gevonden' })
    if (sol.werknemer_id !== uid && sol.werkgever_id !== uid) return res.status(403).json({ error: 'Geen toegang' })
    const isEmployer = uid === sol.werkgever_id
    const receiverId = isEmployer ? sol.werknemer_id : sol.werkgever_id

    const threadId = await ensureThread(id)
    conn = await getConnection()
    await conn.beginTransaction()
    const [threadMsgResult] = await conn.execute(
      `INSERT INTO sollicitatie_thread_messages (thread_id, sender_user_id, receiver_user_id, type, body)
       VALUES (?,?,?,?,?)`,
      [threadId, uid, receiverId, type, messageBody.trim()]
    )
    await conn.commit()

    // stuur notificatiebericht in inbox
    await createMessage({
      receiver_user_id: receiverId,
      sender_user_id: uid,
      type: 'sollicitatie_antwoord',
      related_id: threadMsgResult.insertId || id,
      title: isEmployer ? 'Reactie van werkgever' : 'Reactie van kandidaat',
      body: messageBody.trim(),
      metadata: {
        thread_id: threadId,
        sollicitatie_id: id,
        vacature_id: sol.vacature_id,
        vacature_titel: sol.vacature_titel,
        from_role: role,
        message_type: type,
      },
    })

    await logSystem('sollicitatie_reply', 'info', 'Reactie toegevoegd aan dossier', {
      sollicitatie_id: id,
      sender: uid,
      receiver: receiverId,
      type,
    })
    return res.status(201).json({ ok: true, thread_id: threadId })
  } catch (err) {
    if (conn) {
      try { await conn.rollback() } catch {}
    }
    console.error('POST /api/sollicitaties/:id/react error:', err)
    return res.status(500).json({ error: 'Kon reactie niet opslaan' })
  } finally {
    if (conn) conn.release?.()
  }
})

// Kandidaat accepteert/weigert uitnodiging
router.post('/:id/decision', async (req, res) => {
  let conn = null
  try {
    const { uid } = getUserFromCookies(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })
    const id = Number(req.params.id)
    const decision = normalizeDecision(req.body?.decision)
    const customBody = (req.body?.body || '').toString().trim()
    if (!id) return res.status(400).json({ error: 'Ongeldig id' })
    if (!decision) return res.status(400).json({ error: 'Ongeldige beslissing' })

    const sol = await loadSollicitatieWithUsers(id)
    if (!sol) return res.status(404).json({ error: 'Niet gevonden' })
    if (sol.werknemer_id !== uid && sol.werkgever_id !== uid) return res.status(403).json({ error: 'Geen toegang' })
    if (sol.werknemer_id !== uid) return res.status(403).json({ error: 'Alleen kandidaat kan beslissen' })
    if (sol.status !== 'uitnodiging') {
      return res.status(409).json({ error: 'Uitnodiging is al verwerkt' })
    }

    const receiverId = sol.werkgever_id
    const newStatus = decision === 'accept' ? 'uitnodiging_geaccepteerd' : 'uitnodiging_geweigerd'
    const decisionLabel = decision === 'accept' ? 'Uitnodiging geaccepteerd' : 'Uitnodiging geweigerd'
    const body = customBody || (decision === 'accept'
      ? 'Ik accepteer de uitnodiging.'
      : 'Ik kan helaas niet ingaan op de uitnodiging.')

    const threadId = await ensureThread(id)
    conn = await getConnection()
    await conn.beginTransaction()
    await conn.execute('UPDATE sollicitaties SET status = ? WHERE id = ?', [newStatus, id])
    const [threadMsgResult] = await conn.execute(
      `INSERT INTO sollicitatie_thread_messages (thread_id, sender_user_id, receiver_user_id, type, body)
       VALUES (?,?,?,?,?)`,
      [threadId, uid, receiverId, 'info', body]
    )
    await conn.commit()

    await createMessage({
      receiver_user_id: receiverId,
      sender_user_id: uid,
      type: 'sollicitatie_antwoord',
      related_id: threadMsgResult.insertId || id,
      title: decisionLabel,
      body,
      metadata: {
        thread_id: threadId,
        sollicitatie_id: id,
        vacature_id: sol.vacature_id,
        vacature_titel: sol.vacature_titel,
        status: decisionLabel,
        from_role: sol.werknemer_role,
      },
    })

    await query(
      `UPDATE messages
       SET metadata = JSON_SET(COALESCE(metadata, JSON_OBJECT()), '$.status', ?)
       WHERE receiver_user_id = ? AND type = 'invite' AND related_id = ?`,
      [decisionLabel, uid, id]
    )

    await logSystem('sollicitatie_decision', 'info', 'Uitnodiging verwerkt', {
      sollicitatie_id: id,
      werknemer_id: uid,
      werkgever_id: receiverId,
      decision,
      status: newStatus,
    })
    return res.json({ ok: true, status: newStatus, decision })
  } catch (err) {
    if (conn) {
      try { await conn.rollback() } catch {}
    }
    console.error('POST /api/sollicitaties/:id/decision error:', err)
    return res.status(500).json({ error: 'Kon beslissing niet verwerken' })
  } finally {
    if (conn) conn.release?.()
  }
})

// Dossier archiveren
router.patch('/:id/archive', async (req, res) => {
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })
    const id = Number(req.params.id)
    const sol = await loadSollicitatieWithUsers(id)
    if (!sol) return res.status(404).json({ error: 'Niet gevonden' })
    if (sol.werkgever_id !== uid && role !== 'employer') return res.status(403).json({ error: 'Alleen werkgever kan archiveren' })
    const archived = req.body?.archived === false || req.body?.archived === 'false' ? 0 : 1
    await ensureThread(id)
    await query(
      'UPDATE sollicitatie_threads SET archived = ?, archived_at = CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE NULL END WHERE sollicitatie_id = ?',
      [archived, archived, id]
    )
    await logSystem('sollicitatie_archive', 'info', 'Dossier status aangepast', { id, archived })
    return res.json({ ok: true, archived: !!archived })
  } catch (err) {
    console.error('PATCH /api/sollicitaties/:id/archive error:', err)
    return res.status(500).json({ error: 'Kon archivering niet bijwerken' })
  }
})

export default router
