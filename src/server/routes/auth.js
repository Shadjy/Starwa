import { Router } from 'express'
import bcrypt from 'bcrypt'
import { query } from '../db.js'

const router = Router()

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 12
const VALID_ROLES = ['seeker', 'employer']

function validateRequiredFields(body) {
  const { role } = body
  if (!VALID_ROLES.includes(role)) {
    return { ok: false, message: 'Ongeldige rol geselecteerd.' }
  }

  const seekerFields = ['naam', 'email', 'password']
  const employerFields = ['contactpersoon', 'bedrijfsnaam', 'bedrijfsGrootte', 'email', 'password']
  const required = role === 'seeker' ? seekerFields : employerFields

  const missing = required.filter(field => !body[field])
  if (missing.length > 0) {
    return {
      ok: false,
      message: `Ontbrekende velden: ${missing.join(', ')}`,
    }
  }

  return { ok: true }
}

router.post('/register', async (req, res, next) => {
  try {
    const { role = 'seeker' } = req.body
    const validation = validateRequiredFields({ ...req.body, role })
    if (!validation.ok) {
      return res.status(400).json({ error: validation.message })
    }

    const { email } = req.body
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email])
    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'E-mailadres is al in gebruik.' })
    }

    const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS)

    await query(
      `INSERT INTO users (role, naam, contactpersoon, bedrijfsnaam, bedrijfsGrootte, email, password_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        role,
        role === 'seeker' ? req.body.naam : null,
        role === 'employer' ? req.body.contactpersoon : null,
        role === 'employer' ? req.body.bedrijfsnaam : null,
        role === 'employer' ? req.body.bedrijfsGrootte : null,
        email,
        passwordHash,
      ]
    )

    res.status(201).json({ message: 'Account succesvol aangemaakt.' })
  } catch (error) {
    next(error)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, role } = req.body
    if (!email || !password || !VALID_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ error: 'E-mailadres, wachtwoord en geldige rol zijn verplicht.' })
    }

    const users = await query(
      'SELECT id, role, naam, contactpersoon, bedrijfsnaam, password_hash FROM users WHERE email = ?',
      [email]
    )

    if (users.length === 0) {
      return res.status(401).json({ error: 'Onjuiste inloggegevens.' })
    }

    const user = users[0]
    if (user.role !== role) {
      return res.status(403).json({ error: 'Deze rol hoort niet bij dit account.' })
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash)
    if (!passwordOk) {
      return res.status(401).json({ error: 'Onjuiste inloggegevens.' })
    }

    delete user.password_hash
    res.json({ message: 'Succesvol ingelogd.', user })
  } catch (error) {
    next(error)
  }
})

export default router
