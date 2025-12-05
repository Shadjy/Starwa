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
      `SELECT stm.*, u.naam AS sender_name, u.role AS sender_role
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
