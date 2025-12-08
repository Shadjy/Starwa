import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// List seekers (simple listing for now)
router.get('/', async (req, res) => {
  let sql = `SELECT id, naam, email, created_at FROM users WHERE role = 'seeker'`
  const params = []
  try {
    const { limit = 100 } = req.query
    const lim = Math.max(1, Math.min(Number(limit) || 100, 500))
    sql += ` ORDER BY created_at DESC LIMIT ${lim}`
    const rows = await query(sql, params)
    const items = rows.map(r => ({
      id: r.id,
      name: r.naam || r.email?.split('@')[0] || 'Kandidaat',
      email: r.email,
      created_at: r.created_at,
    }))
    res.json({ items })
  } catch (err) {
    console.error('GET /api/candidates error:', { err, sql, params })
    const payload = { error: 'Kon kandidaten niet laden' }
    if (process.env.NODE_ENV !== 'production') {
      payload.details = String(err?.message || err)
      payload.code = err?.code
      payload.sqlMessage = err?.sqlMessage
      payload.sqlState = err?.sqlState
      payload.sql = sql
      payload.params = params
    }
    res.status(500).json(payload)
  }
})

// Single seeker
router.get('/:id', async (req, res) => {
  let sql = `SELECT id, naam, email, created_at FROM users WHERE role = 'seeker' AND id = ?`
  const params = [Number(req.params.id)]
  try {
    const rows = await query(sql, params)
    const r = rows[0]
    if (!r) return res.status(404).json({ error: 'Niet gevonden' })
    const item = { id: r.id, name: r.naam || r.email?.split('@')[0] || 'Kandidaat', email: r.email, created_at: r.created_at }
    res.json({ item })
  } catch (err) {
    console.error('GET /api/candidates/:id error:', { err, sql, params })
    const payload = { error: 'Kon kandidaat niet laden' }
    if (process.env.NODE_ENV !== 'production') {
      payload.details = String(err?.message || err)
      payload.code = err?.code
      payload.sqlMessage = err?.sqlMessage
      payload.sqlState = err?.sqlState
      payload.sql = sql
      payload.params = params
    }
    res.status(500).json(payload)
  }
})

export default router
