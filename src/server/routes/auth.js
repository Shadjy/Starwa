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
    const { email, password } = req.body || {}
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

    // Succes
    const safeUser = { id: user.id, email: user.email, role: user.role, naam: user.naam }
    if (wantsJson(req)) {
      return res.json({ message: 'Succesvol ingelogd.', user: safeUser })
    }
    return res.redirect(303, '/dashboard')
  } catch (err) {
    next(err)
  }
})

//register
router.post('/register', async (req, res, next) => {
  try {
    const role = req.body.role || 'seeker' 
    const body = { ...req.body, role }

  l
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

    if (wantsJson(req)) {
      return res.status(201).json({ message: 'Geregistreerd.' })
    }
    return res.redirect(303, '/vragenlijst')
  } catch (err) {
    next(err)
  }
})

export default router
