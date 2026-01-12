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

//login to dashbaord
router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role: requestedRole } = req.body || {}
    if (!email || !password) {
      return wantsJson(req)
        ? res.status(400).json({ error: 'Ontbrekende velden.' })
        : res.status(400).send('Ontbrekende velden.')
    }

    const rows = await query('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]
    if (!user) {
      return wantsJson(req)
        ? res.status(401).json({ error: 'Onjuiste inloggegevens.' })
        : res.status(401).send('Onjuiste inloggegevens.')
    }

    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return wantsJson(req)
        ? res.status(401).json({ error: 'Onjuiste inloggegevens.' })
        : res.status(401).send('Onjuiste inloggegevens.')
    }

    // Als via UI een rol is gekozen, moet die overeenkomen met het account
    if (requestedRole && user.role && requestedRole !== user.role) {
      if (wantsJson(req)) {
        return res.status(403).json({ error: 'Rol komt niet overeen met dit account.' })
      }
      const qs = new URLSearchParams({ error: 'role_mismatch', role: requestedRole }).toString()
      return res.redirect(303, `/inlog-aanmeld.html?${qs}`)
    }

    // Succes
    const safeUser = { id: user.id, email: user.email, role: user.role, naam: user.naam }
    // Zet eenvoudige cookies voor backend-koppeling (geen sessie nodig)
    res.cookie('uid', String(user.id), { httpOnly: true, sameSite: 'lax', signed: true })
    res.cookie('role', String(user.role), { httpOnly: true, sameSite: 'lax', signed: true })
    if (wantsJson(req)) {
      return res.json({ message: 'Succesvol ingelogd.', user: safeUser })
    }
    const redirectTo = user.role === 'employer' ? '/dashboard-werkgever' : '/dashboard'
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
    const role = req.body.role || 'seeker' 
    const body = { ...req.body, role }

  
    const seekerRequired = ['naam', 'email', 'password']
    const employerRequired = ['contactpersoon', 'bedrijfsnaam', 'bedrijfsGrootte', 'email', 'password']
    const required = role === 'employer' ? employerRequired : seekerRequired
    const missing = required.filter(f => !body[f])
    if (missing.length) {
      const msg = `Ontbrekende velden: ${missing.join(', ')}`
      return wantsJson(req) ? res.status(400).json({ error: msg }) : res.status(400).send(msg)
    }

   
    const exists = await query('SELECT id FROM users WHERE email = ?', [body.email])
    if (exists.length) {
      return wantsJson(req)
        ? res.status(409).json({ error: 'E-mailadres bestaat al.' })
        : res.status(409).send('E-mailadres bestaat al.')
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

    // Haal nieuw aangemaakte gebruiker op om cookie te zetten
    const [newUser] = await query('SELECT id, role, email, naam FROM users WHERE email = ? LIMIT 1', [body.email])
    if (newUser) {
      res.cookie('uid', String(newUser.id), { httpOnly: true, sameSite: 'lax', signed: true })
      res.cookie('role', String(newUser.role), { httpOnly: true, sameSite: 'lax', signed: true })
    }
    if (wantsJson(req)) {
      return res.status(201).json({ message: 'Geregistreerd.' })
    }
    const redirectAfterRegister = role === 'employer' ? '/dashboard-werkgever' : '/vragenlijst'
    return res.redirect(303, redirectAfterRegister)
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
