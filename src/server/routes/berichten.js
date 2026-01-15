import express from 'express'
import { listMessagesForUser, markMessageRead } from '../services/messages.js'

const router = express.Router()

function getUserFromCookies(req) {
  const uid = req.signedCookies?.uid || req.cookies?.uid
  const role = req.signedCookies?.role || req.cookies?.role
  return { uid: uid ? Number(uid) : null, role }
}

// Berichten van ingelogde gebruiker
router.get('/', async (req, res) => {
  try {
    const { uid } = getUserFromCookies(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })
    const items = await listMessagesForUser(uid, { limit: req.query.limit })
    return res.json({ items })
  } catch (err) {
    console.error('GET /api/berichten error:', err)
    return res.status(500).json({ error: 'Kon berichten niet laden' })
  }
})

// Markeer gelezen/ongelezen
router.patch('/:id/read', async (req, res) => {
  try {
    const { uid } = getUserFromCookies(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })
    const id = Number(req.params.id)
    const read = req.body?.read !== false && req.body?.read !== 'false'
    if (!id) return res.status(400).json({ error: 'Ongeldig id' })
    await markMessageRead(id, uid, read)
    return res.json({ ok: true, read })
  } catch (err) {
    console.error('PATCH /api/berichten/:id/read error:', err)
    return res.status(500).json({ error: 'Kon status niet bijwerken' })
  }
})

export default router
