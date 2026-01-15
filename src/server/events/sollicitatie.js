import { EVENTS } from './bus.js'
import { query } from '../db.js'
import { createMessage } from '../services/messages.js'
import { logSystem } from '../services/logger.js'

async function loadSollicitatieContext(sollicitatieId) {
  const rows = await query(
    `SELECT s.*, v.functietitel AS vacature_titel, v.locatie AS vacature_locatie, v.dienstverband, v.uren_per_week,
            v.employer_id AS vacature_employer_id,
            wn.naam AS werknemer_naam, wn.email AS werknemer_email,
            wg.naam AS werkgever_naam, wg.bedrijfsnaam AS werkgever_bedrijfsnaam, wg.email AS werkgever_email
     FROM sollicitaties s
     JOIN vacancies v ON v.id = s.vacature_id
     JOIN users wn ON wn.id = s.werknemer_id
     JOIN users wg ON wg.id = s.werkgever_id
     LEFT JOIN sollicitatie_threads st ON st.sollicitatie_id = s.id
     WHERE s.id = ?
     LIMIT 1`,
    [sollicitatieId]
  )
  return rows[0]
}

export function registerSollicitatieListeners(bus) {
  bus.on(EVENTS.SOLLICITATIE_NIEUW, async ({ sollicitatieId }) => {
    try {
      // Ensure dossier thread exists
      const threadInsert = await query(
        `INSERT INTO sollicitatie_threads (sollicitatie_id) VALUES (?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [sollicitatieId]
      )
      let threadId = threadInsert.insertId
      if (!threadId) {
        const existing = await query('SELECT id FROM sollicitatie_threads WHERE sollicitatie_id = ? LIMIT 1', [sollicitatieId])
        threadId = existing?.[0]?.id
      }

      const ctx = await loadSollicitatieContext(sollicitatieId)
      if (!ctx) {
        await logSystem('sollicitatie_event_missing', 'warning', 'Sollicitatie niet gevonden voor event', { sollicitatieId })
        return
      }

      const vacatureTitel = ctx.vacature_titel || 'Vacature'
      const werkgeverNaam = ctx.werkgever_naam || ctx.werkgever_bedrijfsnaam || 'Werkgever'
      const werknemerNaam = ctx.werknemer_naam || ctx.werknemer_email || 'Kandidaat'
      const metaCommon = {
        vacature_id: ctx.vacature_id,
        vacature_titel: vacatureTitel,
        sollicitatie_id: ctx.id,
        werknemer_id: ctx.werknemer_id,
        werkgever_id: ctx.werkgever_id,
        created_at: ctx.created_at,
      }

      // Bericht naar werknemer (bevestiging)
      await createMessage({
        receiver_user_id: ctx.werknemer_id,
        sender_user_id: ctx.werkgever_id,
        type: 'sollicitatie_bevestiging',
        related_id: ctx.id,
        title: `Bevestiging sollicitatie: ${vacatureTitel}`,
        body: `Je sollicitatie is succesvol verstuurd naar '${werkgeverNaam}'.`,
        metadata: {
          ...metaCommon,
          thread_id: threadId,
          werkgever_naam: werkgeverNaam,
          vacature_locatie: ctx.vacature_locatie,
          dienstverband: ctx.dienstverband,
        },
      })

      // Bericht naar werkgever (notificatie)
      await createMessage({
        receiver_user_id: ctx.werkgever_id,
        sender_user_id: ctx.werknemer_id,
        type: 'sollicitatie_notificatie',
        related_id: ctx.id,
        title: 'Nieuwe sollicitatie ontvangen',
        body: `${werknemerNaam} heeft gesolliciteerd op ${vacatureTitel}.`,
        metadata: {
          ...metaCommon,
          thread_id: threadId,
          werknemer_naam: werknemerNaam,
          werknemer_email: ctx.werknemer_email,
          link: `/dashboard-werkgever?sollicitatie=${ctx.id}`,
        },
      })

      await logSystem('sollicitatie_event_processed', 'info', 'Berichten aangemaakt na sollicitatie', { sollicitatieId })
    } catch (err) {
      await logSystem('sollicitatie_event_error', 'error', 'Fout in sollicitatie listener', {
        sollicitatieId,
        error: err?.message,
      })
      console.error('[sollicitatie listener] error:', err)
    }
  })
}

export default registerSollicitatieListeners
