import express from 'express'
import { query } from '../db.js'

const router = express.Router()

const skipKeywords = ['alle', 'geen voorkeur']

function normalizeFilter(value) {
  if (value == null) return null
  const text = String(value).trim()
  if (!text) return null
  const lower = text.toLowerCase()
  if (skipKeywords.includes(lower)) return null
  return lower
}

function getUserFromCookies(req) {
  const rawUid = req.signedCookies?.uid || req.cookies?.uid
  const uid = Number(rawUid)
  const role = (req.signedCookies?.role || req.cookies?.role || '').toLowerCase()
  return {
    uid: Number.isFinite(uid) ? uid : null,
    role: role || null,
  }
}

function cleanString(value) {
  if (value === undefined || value === null) return null
  const text = String(value).trim()
  return text ? text : null
}

function normalizeInputList(value) {
  if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean)
  if (value == null) return []
  const text = String(value).trim()
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed.map(v => String(v || '').trim()).filter(Boolean)
    }
  } catch {}
  return text.split(/[\r\n,;•]+/).map(v => v.trim()).filter(Boolean)
}

function toJsonArray(value) {
  const items = normalizeInputList(value)
  return items.length ? JSON.stringify(items) : null
}

function sanitizeNumber(value) {
  if (value === undefined || value === null || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function toArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean)
  let text = String(value).trim()
  if (!text) return []
  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) {
      return parsed.map(v => String(v || '').trim()).filter(Boolean)
    }
    if (typeof parsed === 'string') text = parsed.trim()
  } catch {}
  return text
    .split(/[\r\n,;•]+/)
    .map(v => v.trim())
    .filter(Boolean)
}

function mapCandidateRow(row) {
  const userName = row.naam?.trim() || row.user_name?.trim() || ''
  const email = row.email_adres || row.user_email || null
  const skills = toArray(row.vaardigheden)
  const languages = toArray(row.talen)
  const experience = toArray(row.ervaring)
  return {
    id: row.id,
    user_id: row.user_id,
    name: userName || email?.split('@')[0] || 'Kandidaat',
    email,
    currentTitle: row.huidige_functie || null,
    desiredRole: row.gewilde_functie || null,
    locatie: row.locatie || null,
    beschikbaarheid: row.beschikbaarheid || null,
    contractType: row.contracttype || null,
    sector: row.sector || null,
    uren: row.uren_per_week || null,
    salaryIndicatie: row.salarisindicatie || null,
    skills,
    details: {
      cvUrl: row.cv_link || null,
      portfolio: row.portfolio_link || null,
      github: row.github_link || null,
      salaryExpectation: row.salarisindicatie || null,
      languages,
      experience,
      notes: row.notities || null,
      email,
      phone: row.telefoonnummer || null,
    },
    score: null,
    why: [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

// List seekers
router.get('/', async (req, res) => {
  let sql = `
    SELECT ci.*, u.email AS user_email, u.naam AS user_name
    FROM candidates_info ci
    JOIN users u ON u.id = ci.user_id
  `
  const params = []
  try {
    const {
      locatie,
      sector,
      contract,
      beschikbaarheid,
      functie,
      skill,
      uren,
      limit = 100,
    } = req.query

    const normalizedLimits = Math.max(1, Math.min(Number(limit) || 100, 200))
    const wheres = ['u.role = \'seeker\'']

    const applyTextFilter = (value, clause) => {
      if (!clause || !value) return
      wheres.push(clause)
      params.push(value)
    }

    const locatieNorm = normalizeFilter(locatie)
    if (locatieNorm) {
      applyTextFilter(`%${locatieNorm}%`, 'LOWER(ci.locatie) LIKE ?')
    }
    const sectorNorm = normalizeFilter(sector)
    if (sectorNorm) {
      applyTextFilter(`%${sectorNorm}%`, 'LOWER(ci.sector) LIKE ?')
    }
    const contractNorm = normalizeFilter(contract)
    if (contractNorm) {
      applyTextFilter(`%${contractNorm}%`, 'LOWER(ci.contracttype) LIKE ?')
    }
    const beschikbaarheidNorm = normalizeFilter(beschikbaarheid)
    if (beschikbaarheidNorm) {
      applyTextFilter(`%${beschikbaarheidNorm}%`, 'LOWER(ci.beschikbaarheid) LIKE ?')
    }
    const functieNorm = normalizeFilter(functie)
    if (functieNorm) {
      wheres.push('(LOWER(ci.huidige_functie) LIKE ? OR LOWER(ci.gewilde_functie) LIKE ?)')
      params.push(`%${functieNorm}%`, `%${functieNorm}%`)
    }
    const skillNorm = normalizeFilter(skill)
    if (skillNorm) {
      applyTextFilter(`%${skillNorm}%`, 'LOWER(COALESCE(ci.vaardigheden, "")) LIKE ?')
    }
    if (typeof uren === 'string' && uren.trim()) {
      const parsedUren = Number(uren.trim())
      if (!Number.isNaN(parsedUren)) {
        wheres.push('ci.uren_per_week = ?')
        params.push(parsedUren)
      }
    }

    if (wheres.length) sql += ` WHERE ${wheres.join(' AND ')}`
    sql += ` ORDER BY ci.updated_at DESC LIMIT ${normalizedLimits}`

    const rows = await query(sql, params)
    const items = rows.map(mapCandidateRow)
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

// Self-service kandidaatprofiel
router.get('/me', async (req, res) => {
  const { uid, role } = getUserFromCookies(req)
  if (!uid || role !== 'seeker') {
    return res.status(401).json({ error: 'Niet ingelogd als kandidaat' })
  }
  const sql = `
    SELECT ci.*, u.email AS user_email, u.naam AS user_name
    FROM candidates_info ci
    JOIN users u ON u.id = ci.user_id
    WHERE ci.user_id = ? AND u.role = 'seeker'
    LIMIT 1
  `
  const params = [uid]
  try {
    const rows = await query(sql, params)
    if (!rows.length) return res.json({ item: null })
    return res.json({ item: mapCandidateRow(rows[0]) })
  } catch (err) {
    console.error('GET /api/candidates/me error:', { err, sql, params })
    const payload = { error: 'Kon kandidaatgegevens niet laden' }
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

router.post('/', async (req, res) => {
  const { uid, role } = getUserFromCookies(req)
  if (!uid || role !== 'seeker') {
    return res.status(401).json({ error: 'Niet ingelogd als kandidaat' })
  }
  const body = req.body || {}
  const insertSql = `
    INSERT INTO candidates_info (
      user_id, naam, huidige_functie, gewilde_functie, locatie, beschikbaarheid, contracttype,
      sector, uren_per_week, salarisindicatie, vaardigheden, cv_link, portfolio_link, github_link,
      talen, ervaring, email_adres, telefoonnummer, notities
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      naam = VALUES(naam),
      huidige_functie = VALUES(huidige_functie),
      gewilde_functie = VALUES(gewilde_functie),
      locatie = VALUES(locatie),
      beschikbaarheid = VALUES(beschikbaarheid),
      contracttype = VALUES(contracttype),
      sector = VALUES(sector),
      uren_per_week = VALUES(uren_per_week),
      salarisindicatie = VALUES(salarisindicatie),
      vaardigheden = VALUES(vaardigheden),
      cv_link = VALUES(cv_link),
      portfolio_link = VALUES(portfolio_link),
      github_link = VALUES(github_link),
      talen = VALUES(talen),
      ervaring = VALUES(ervaring),
      email_adres = VALUES(email_adres),
      telefoonnummer = VALUES(telefoonnummer),
      notities = VALUES(notities)
  `
  const params = [
    uid,
    cleanString(body.naam ?? body.name),
    cleanString(body.huidige_functie),
    cleanString(body.gewilde_functie),
    cleanString(body.locatie),
    cleanString(body.beschikbaarheid),
    cleanString(body.contracttype),
    cleanString(body.sector),
    sanitizeNumber(body.uren_per_week),
    cleanString(body.salarisindicatie),
    toJsonArray(body.vaardigheden ?? body.skills),
    cleanString(body.cv_link),
    cleanString(body.portfolio_link),
    cleanString(body.github_link),
    toJsonArray(body.talen ?? body.languages),
    toJsonArray(body.ervaring),
    cleanString(body.email_adres),
    cleanString(body.telefoonnummer),
    cleanString(body.notities),
  ]
  try {
    await query(insertSql, params)
    const detailSql = `
      SELECT ci.*, u.email AS user_email, u.naam AS user_name
      FROM candidates_info ci
      JOIN users u ON u.id = ci.user_id
      WHERE ci.user_id = ? AND u.role = 'seeker'
      LIMIT 1
    `
    const detailRows = await query(detailSql, [uid])
    if (!detailRows.length) {
      return res.status(500).json({ error: 'Kon kandidaat niet vinden' })
    }
    return res.json({ item: mapCandidateRow(detailRows[0]) })
  } catch (err) {
    console.error('POST /api/candidates error:', { err, sql: insertSql, params })
    const payload = { error: 'Kon kandidaatgegevens niet opslaan' }
    if (process.env.NODE_ENV !== 'production') {
      payload.details = String(err?.message || err)
      payload.code = err?.code
      payload.sqlMessage = err?.sqlMessage
      payload.sqlState = err?.sqlState
      payload.sql = insertSql
      payload.params = params
    }
    res.status(500).json(payload)
  }
})

// Single seeker (detail)
router.get('/:id', async (req, res) => {
  const sql = `
    SELECT ci.*, u.email AS user_email, u.naam AS user_name
    FROM candidates_info ci
    JOIN users u ON u.id = ci.user_id
    WHERE ci.id = ? AND u.role = 'seeker'
  `
  const params = [Number(req.params.id)]
  try {
    const rows = await query(sql, params)
    const row = rows[0]
    if (!row) return res.status(404).json({ error: 'Niet gevonden' })
    res.json({ item: mapCandidateRow(row) })
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
