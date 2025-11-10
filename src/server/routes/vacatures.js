import express from 'express'
import { query } from '../db.js'

const router = express.Router()

function getUserFromCookies(req) {
  const uid = req.signedCookies?.uid || req.cookies?.uid
  const role = req.signedCookies?.role || req.cookies?.role
  return { uid: uid ? Number(uid) : null, role }
}

// List vacancies
router.get('/', async (req, res) => {
  let sql = 'SELECT v.*, COALESCE(cp.bedrijfsnaam, u.bedrijfsnaam) AS company_name\n             FROM vacancies v\n             LEFT JOIN company_profiles cp ON cp.id = v.company_profile_id\n             LEFT JOIN users u ON u.id = v.employer_id'
  const params = []
  try {
    const { employer_id, limit = 50, mine, active } = req.query
    const { uid, role } = getUserFromCookies(req)
    const lim = Math.max(1, Math.min(Number(limit) || 50, 200))

    const wheres = []
    if (mine && role === 'employer' && uid) {
      wheres.push('v.employer_id = ?')
      params.push(uid)
    } else if (employer_id) {
      wheres.push('v.employer_id = ?')
      params.push(Number(employer_id))
    }
    // Active filter: default only active for non-owner listings
    if (active === '1' || active === 'true') {
      wheres.push('v.is_active = 1')
    } else if (active === '0' || active === 'false') {
      wheres.push('v.is_active = 0')
    } else if (!(mine && role === 'employer')) {
      // seeker or general listing -> only active by default
      wheres.push('v.is_active = 1')
    }
    if (wheres.length) sql += ' WHERE ' + wheres.join(' AND ')

    sql += ` ORDER BY v.created_at DESC LIMIT ${lim}`
    const rows = await query(sql, params)
    const data = rows.map(r => ({
      ...r,
      vaardigheden: (() => {
        try { return r.vaardigheden ? JSON.parse(r.vaardigheden) : [] } catch { return [] }
      })(),
    }))
    res.json({ items: data })
  } catch (err) {
    console.error('GET /api/vacatures error:', { err, sql, params })
    const payload = { error: 'Kon vacatures niet laden' }
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

// Get single vacancy (only own when mine=1 or by id + ownership check)
router.get('/:id', async (req, res) => {
  let sql = 'SELECT v.*, COALESCE(cp.bedrijfsnaam, u.bedrijfsnaam) AS company_name\n             FROM vacancies v\n             LEFT JOIN company_profiles cp ON cp.id = v.company_profile_id\n             LEFT JOIN users u ON u.id = v.employer_id\n             WHERE v.id = ?'
  const params = [Number(req.params.id)]
  try {
    const rows = await query(sql, params)
    const v = rows[0]
    if (!v) return res.status(404).json({ error: 'Niet gevonden' })
    // Parse skills
    try { v.vaardigheden = v.vaardigheden ? JSON.parse(v.vaardigheden) : [] } catch { v.vaardigheden = [] }
    return res.json({ item: v })
  } catch (err) {
    console.error('GET /api/vacatures/:id error:', { err, sql, params })
    const payload = { error: 'Kon vacature niet laden' }
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

// Create vacancy
router.post('/', async (req, res) => {
  let sql = ''
  let params = []
  try {
    const {
      employer_id = null,
      company_profile_id = null,
      functietitel,
      categorie,
      locatie,
      dienstverband,
      uren_per_week,
      salaris_min,
      salaris_max,
      opleidingsniveau,
      ervaring_jaren,
      vaardigheden, // array of strings or csv
      omschrijving,
      startdatum,
      posities,
      contractduur,
      contactpersoon,
      is_active,
    } = req.body || {}

    // Basic validation for key matching fields
    const missing = []
    if (!functietitel) missing.push('functietitel')
    if (!categorie) missing.push('categorie')
    if (!locatie) missing.push('locatie')
    if (!dienstverband) missing.push('dienstverband')
    if (uren_per_week === undefined || uren_per_week === null || Number.isNaN(Number(uren_per_week))) missing.push('uren_per_week')
    if (ervaring_jaren === undefined || ervaring_jaren === null || Number.isNaN(Number(ervaring_jaren))) missing.push('ervaring_jaren')
    if (!opleidingsniveau) missing.push('opleidingsniveau')

    if (missing.length) {
      return res.status(400).json({ error: 'Ontbrekende velden', fields: missing })
    }

    const skillsValue = Array.isArray(vaardigheden)
      ? JSON.stringify(vaardigheden)
      : (typeof vaardigheden === 'string' ? JSON.stringify(vaardigheden.split(',').map(s => s.trim()).filter(Boolean)) : null)

    // Employer koppeling via cookie als niet meegegeven
    const { uid, role } = getUserFromCookies(req)
    const resolvedEmployerId = employer_id || (role === 'employer' ? uid : null)
    if (!resolvedEmployerId) {
      return res.status(401).json({ error: 'Niet ingelogd als werkgever' })
    }

    sql = `
      INSERT INTO vacancies
      (
        employer_id, company_profile_id, functietitel, categorie, locatie, dienstverband,
        uren_per_week, salaris_min, salaris_max, opleidingsniveau, ervaring_jaren,
        vaardigheden, omschrijving, startdatum, posities, contractduur, contactpersoon,
        is_active
      ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `

    params = [
      resolvedEmployerId || null,
      company_profile_id || null,
      functietitel,
      categorie,
      locatie,
      dienstverband,
      Number(uren_per_week),
      salaris_min !== undefined && salaris_min !== null && salaris_min !== '' ? Number(salaris_min) : null,
      salaris_max !== undefined && salaris_max !== null && salaris_max !== '' ? Number(salaris_max) : null,
      opleidingsniveau,
      Number(ervaring_jaren),
      skillsValue,
      omschrijving || null,
      startdatum || null,
      posities !== undefined && posities !== null && posities !== '' ? Number(posities) : null,
      contractduur || null,
      contactpersoon || null,
      (is_active === 0 || is_active === '0' || is_active === false || is_active === 'false') ? 0 : 1,
    ]

    const result = await query(sql, params)
    return res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error('POST /api/vacatures error:', { err, sql, params })
    const payload = { error: 'Kon vacature niet opslaan' }
    if (process.env.NODE_ENV !== 'production') {
      payload.details = String(err?.message || err)
      payload.code = err?.code
      payload.sqlMessage = err?.sqlMessage
      payload.sqlState = err?.sqlState
      payload.sql = sql
      payload.params = params
    }
    return res.status(500).json(payload)
  }
})

// Update vacancy (only owner)
router.put('/:id', async (req, res) => {
  let sql = ''
  let params = []
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid || role !== 'employer') return res.status(401).json({ error: 'Niet ingelogd als werkgever' })

    const id = Number(req.params.id)
    const existing = await query('SELECT employer_id FROM vacancies WHERE id = ?', [id])
    if (!existing.length) return res.status(404).json({ error: 'Niet gevonden' })
    if (existing[0].employer_id !== uid) return res.status(403).json({ error: 'Geen toestemming' })

    const body = req.body || {}
    const fields = {
      functietitel: body.functietitel,
      categorie: body.categorie,
      locatie: body.locatie,
      dienstverband: body.dienstverband,
      uren_per_week: body.uren_per_week != null ? Number(body.uren_per_week) : null,
      salaris_min: body.salaris_min !== '' && body.salaris_min != null ? Number(body.salaris_min) : null,
      salaris_max: body.salaris_max !== '' && body.salaris_max != null ? Number(body.salaris_max) : null,
      opleidingsniveau: body.opleidingsniveau,
      ervaring_jaren: body.ervaring_jaren != null ? Number(body.ervaring_jaren) : null,
      vaardigheden: Array.isArray(body.vaardigheden)
        ? JSON.stringify(body.vaardigheden)
        : (typeof body.vaardigheden === 'string' ? JSON.stringify(body.vaardigheden.split(',').map(s => s.trim()).filter(Boolean)) : null),
      omschrijving: body.omschrijving ?? null,
      startdatum: body.startdatum || null,
      posities: body.posities !== '' && body.posities != null ? Number(body.posities) : null,
      contractduur: body.contractduur ?? null,
      contactpersoon: body.contactpersoon ?? null,
      is_active: (body.is_active === 0 || body.is_active === '0' || body.is_active === false || body.is_active === 'false') ? 0
                 : (body.is_active === 1 || body.is_active === '1' || body.is_active === true || body.is_active === 'true') ? 1
                 : undefined,
    }

    const setParts = []
    const setParams = []
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined) { setParts.push(`${k} = ?`); setParams.push(v) }
    }
    if (!setParts.length) return res.status(400).json({ error: 'Geen velden om bij te werken' })
    sql = `UPDATE vacancies SET ${setParts.join(', ')} WHERE id = ?`
    params = [...setParams, id]
    await query(sql, params)
    return res.json({ ok: true })
  } catch (err) {
    console.error('PUT /api/vacatures/:id error:', { err, sql, params })
    const payload = { error: 'Kon vacature niet bijwerken' }
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

// Toggle/set active state (only owner)
router.patch('/:id/active', async (req, res) => {
  let sql = ''
  let params = []
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid || role !== 'employer') return res.status(401).json({ error: 'Niet ingelogd als werkgever' })

    const id = Number(req.params.id)
    const existing = await query('SELECT employer_id FROM vacancies WHERE id = ?', [id])
    if (!existing.length) return res.status(404).json({ error: 'Niet gevonden' })
    if (existing[0].employer_id !== uid) return res.status(403).json({ error: 'Geen toestemming' })

    const body = req.body || {}
    const value = (body.is_active === 1 || body.is_active === '1' || body.is_active === true || body.is_active === 'true') ? 1 : 0
    sql = 'UPDATE vacancies SET is_active = ? WHERE id = ?'
    params = [value, id]
    await query(sql, params)
    return res.json({ ok: true, is_active: value })
  } catch (err) {
    console.error('PATCH /api/vacatures/:id/active error:', { err, sql, params })
    const payload = { error: 'Kon status niet bijwerken' }
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

// Delete vacancy (only owner)
router.delete('/:id', async (req, res) => {
  let sql = ''
  let params = []
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid || role !== 'employer') return res.status(401).json({ error: 'Niet ingelogd als werkgever' })

    const id = Number(req.params.id)
    const existing = await query('SELECT employer_id FROM vacancies WHERE id = ?', [id])
    if (!existing.length) return res.status(404).json({ error: 'Niet gevonden' })
    if (existing[0].employer_id !== uid) return res.status(403).json({ error: 'Geen toestemming' })
    sql = 'DELETE FROM vacancies WHERE id = ?'
    params = [id]
    await query(sql, params)
    return res.json({ ok: true })
  } catch (err) {
    console.error('DELETE /api/vacatures/:id error:', { err, sql, params })
    const payload = { error: 'Kon vacature niet verwijderen' }
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
