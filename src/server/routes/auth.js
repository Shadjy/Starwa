import { Router } from 'express'
import bcrypt from 'bcrypt'
import { query } from '../db.js'

const router = Router()
const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12

function wantsJson(req) {
  const accept = (req.headers.accept || '').toLowerCase()
  const xhr = (req.headers['x-requested-with'] || '').toLowerCase()
  const ct = (req.headers['content-type'] || '').toLowerCase()
  return accept.includes('application/json') || xhr.includes('xmlhttprequest') || ct.includes('application/json')
}

function normalizeRole(role) {
  const value = String(role || '').toLowerCase()
  if (value === 'employer' || value === 'werkgever') return 'employer'
  if (value === 'seeker' || value === 'werkzoeker' || value === 'worker') return 'seeker'
  return ''
}

//login to dashbaord
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      if (wantsJson(req)) {
        return res.status(400).json({ error: 'Ontbrekende velden.' })
      }
      const qs = new URLSearchParams({ error: 'missing' }).toString()
      return res.redirect(303, `/login?${qs}`)
    }

    const rows = await query('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]
    if (!user) {
      if (wantsJson(req)) {
        return res.status(401).json({ error: 'Onjuiste inloggegevens.' })
      }
      const qs = new URLSearchParams({ error: 'invalid' }).toString()
      return res.redirect(303, `/login?${qs}`)
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      if (wantsJson(req)) {
        return res.status(401).json({ error: 'Onjuiste inloggegevens.' })
      }
      const qs = new URLSearchParams({ error: 'invalid' }).toString()
      return res.redirect(303, `/login?${qs}`)
    }

    const normalizedRole = normalizeRole(user.role)
    if (!normalizedRole) {
      const error = user.role ? 'role_unknown' : 'role_missing'
      console.error('[auth] Login zonder geldige rol:', { userId: user.id, role: user.role })
      if (wantsJson(req)) {
        return res.status(403).json({ error: 'Account rol ontbreekt of is ongeldig.' })
      }
      const qs = new URLSearchParams({ error }).toString()
      return res.redirect(303, `/login?${qs}`)
    }

    // Succes
    const safeUser = { id: user.id, email: user.email, role: normalizedRole, naam: user.naam }
    // Zet eenvoudige cookies voor backend-koppeling (geen sessie nodig)
    res.cookie('uid', String(user.id), { httpOnly: true, sameSite: 'lax', signed: true })
    res.cookie('role', normalizedRole, { httpOnly: true, sameSite: 'lax', signed: true })
    if (wantsJson(req)) {
      return res.json({ message: 'Succesvol ingelogd.', user: safeUser })
    }
    const redirectTo = normalizedRole === 'employer' ? '/dashboard-werkgever' : '/dashboard'
    return res.redirect(303, redirectTo)
  } catch (err) {
    next(err)
  }
})

router.get('/login', (_req, res) => {
  return res.status(405).json({ error: 'Method Not Allowed' })
})

//register
router.post('/register', async (req, res, next) => {
  try {
    const rawRole = req.body?.role
    const role = normalizeRole(rawRole || 'seeker')
    if (!role) {
      const qs = new URLSearchParams({ error: 'role_invalid' }).toString()
      return wantsJson(req)
        ? res.status(400).json({ error: 'Ongeldige rol.' })
        : res.redirect(303, `/register?${qs}`)
    }
    const body = { ...req.body, role }

  
    const seekerRequired = ['naam', 'email', 'password']
    const employerRequired = ['contactpersoon', 'bedrijfsnaam', 'bedrijfsGrootte', 'email', 'password']
    const required = role === 'employer' ? employerRequired : seekerRequired
    const missing = required.filter(f => !body[f])
    if (missing.length) {
      const msg = `Ontbrekende velden: ${missing.join(', ')}`
      if (wantsJson(req)) {
        return res.status(400).json({ error: msg })
      }
      const qs = new URLSearchParams({ error: 'missing', role }).toString()
      return res.redirect(303, `/register?${qs}`)
    }

   
    const exists = await query('SELECT id FROM users WHERE email = ?', [body.email])
    if (exists.length) {
      if (wantsJson(req)) {
        return res.status(409).json({ error: 'E-mailadres bestaat al.' })
      }
      const qs = new URLSearchParams({ error: 'exists', role }).toString()
      return res.redirect(303, `/register?${qs}`)
    }

    const hash = await bcrypt.hash(body.password, SALT_ROUNDS)

    if (role === 'employer') {
      await query(
        `INSERT INTO users (role, contactpersoon, bedrijfsnaam, bedrijfsGrootte, email, password_hash)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [role, body.contactpersoon, body.bedrijfsnaam, body.bedrijfsGrootte, body.email, hash]
      )
    } else {
      await query(
        `INSERT INTO users (role, naam, email, password_hash)
         VALUES (?, ?, ?, ?)`,
        [role, body.naam, body.email, hash]
      )
    }

    if (wantsJson(req)) {
      return res.status(201).json({ message: 'Geregistreerd.' })
    }
    return res.redirect(303, '/login?registered=1')
  } catch (err) {
    next(err)
  }
})

router.get('/register', (_req, res) => {
  return res.status(405).json({ error: 'Method Not Allowed' })
})

// Huidige gebruiker (afgeleid van cookies)
router.get('/me', async (req, res, next) => {
  try {
    const uid = req.signedCookies?.uid || req.cookies?.uid
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })
    const rows = await query('SELECT id, role, email, naam, contactpersoon, bedrijfsnaam, bedrijfsGrootte FROM users WHERE id = ? LIMIT 1', [uid])
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Niet ingelogd' })
    return res.json({ user })
  } catch (err) {
    next(err)
  }
})

// Eenvoudige logout
router.post('/logout', (req, res) => {
  res.clearCookie('uid')
  res.clearCookie('role')
  res.clearCookie('uid', { signed: true })
  res.clearCookie('role', { signed: true })
  return res.json({ message: 'Uitgelogd' })
})

export default router
