import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

function getUserId(req) {
  return req.signedCookies?.uid || req.cookies?.uid
}

function normalizeName(user = {}) {
  return user.naam || user.contactpersoon || (user.email ? user.email.split('@')[0] : null)
}

// GET profiel van ingelogde gebruiker
router.get('/me', async (req, res, next) => {
  try {
    const uid = getUserId(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })

    const [user] = await query(
      'SELECT id, role, naam, contactpersoon, email FROM users WHERE id = ? LIMIT 1',
      [uid]
    )
    if (!user) return res.status(401).json({ error: 'Niet ingelogd' })

    const [profile] = await query(
      `SELECT phone, address, city, degree, work_experience, work_wishes, work_location, work_hours, avatar_url
       FROM user_profiles WHERE user_id = ? LIMIT 1`,
      [uid]
    )

    return res.json({
      user: {
        id: user.id,
        role: user.role,
        naam: user.naam,
        contactpersoon: user.contactpersoon,
        email: user.email,
        displayName: normalizeName(user),
      },
      profile: profile || null,
    })
  } catch (err) {
    next(err)
  }
})

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/

// Update profiel van ingelogde gebruiker
router.put('/me', async (req, res, next) => {
  try {
    const uid = getUserId(req)
    if (!uid) return res.status(401).json({ error: 'Niet ingelogd' })

    const body = req.body || {}
    const updates = []
    const params = []

    if (typeof body.naam === 'string' && body.naam.trim()) {
      updates.push('naam = ?')
      params.push(body.naam.trim())
    }

    if (typeof body.email === 'string' && body.email.trim()) {
      const email = body.email.trim().toLowerCase()
      if (!EMAIL_RE.test(email)) {
        return res.status(400).json({ error: 'Ongeldig e-mailadres' })
      }
      // Unieke e-mail afdwingen behalve voor eigen account
      const conflict = await query(
        'SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1',
        [email, uid]
      )
      if (conflict?.length) {
        return res.status(409).json({ error: 'E-mailadres is al in gebruik' })
      }
      updates.push('email = ?')
      params.push(email)
    }

    if (updates.length) {
      params.push(uid)
      await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params)
    }

    // Haal huidige profielwaarden op zodat we alleen velden overschrijven die aangeleverd zijn
    const [existingProfile] = await query(
      `SELECT phone, address, city, degree, work_experience, work_wishes, work_location, work_hours, avatar_url
       FROM user_profiles WHERE user_id = ? LIMIT 1`,
      [uid]
    )
    const current = existingProfile || {}

    const pick = (key, fallback = null) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) return body[key] ?? null
      return current[key] ?? fallback
    }

    const profilePayload = {
      phone: pick('phone'),
      address: pick('address'),
      city: pick('city'),
      degree: pick('degree'),
      work_experience: pick('workExperience'),
      work_wishes: pick('workWishes'),
      work_location: pick('workLocation'),
      work_hours: pick('workHours'),
      avatar_url: pick('avatarUrl'),
    }

    await query(
      `INSERT INTO user_profiles
        (user_id, phone, address, city, degree, work_experience, work_wishes, work_location, work_hours, avatar_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        phone = VALUES(phone),
        address = VALUES(address),
        city = VALUES(city),
        degree = VALUES(degree),
        work_experience = VALUES(work_experience),
        work_wishes = VALUES(work_wishes),
        work_location = VALUES(work_location),
        work_hours = VALUES(work_hours),
        avatar_url = VALUES(avatar_url)`,
      [
        uid,
        profilePayload.phone,
        profilePayload.address,
        profilePayload.city,
        profilePayload.degree,
        profilePayload.work_experience,
        profilePayload.work_wishes,
        profilePayload.work_location,
        profilePayload.work_hours,
        profilePayload.avatar_url,
      ]
    )

    const [user] = await query(
      'SELECT id, role, naam, contactpersoon, email FROM users WHERE id = ? LIMIT 1',
      [uid]
    )
    return res.json({
      message: 'Profiel opgeslagen',
      user: user ? { ...user, displayName: normalizeName(user) } : null,
      profile: profilePayload,
    })
  } catch (err) {
    next(err)
  }
})

export default router
