import express from 'express'
import { query } from '../db.js'

const router = express.Router()

function getUserFromCookies(req) {
  const uid = req.signedCookies?.uid || req.cookies?.uid
  const role = req.signedCookies?.role || req.cookies?.role
  return { uid: uid ? Number(uid) : null, role }
}

// Haal bedrijfsprofiel van ingelogde werkgever
router.get('/me', async (req, res) => {
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid || role !== 'employer') return res.status(401).json({ error: 'Niet ingelogd als werkgever' })
    const rows = await query('SELECT * FROM company_profiles WHERE user_id = ? LIMIT 1', [uid])
    const profile = rows[0] || null
    return res.json({ profile })
  } catch (err) {
    console.error('GET /api/company/me error:', err)
    return res.status(500).json({ error: 'Kon profiel niet laden' })
  }
})

// Maak/bewerk bedrijfsprofiel (upsert)
router.post('/', async (req, res) => {
  try {
    const { uid, role } = getUserFromCookies(req)
    if (!uid || role !== 'employer') return res.status(401).json({ error: 'Niet ingelogd als werkgever' })

    const {
      bedrijfsnaam,
      kvk_nummer,
      sector,
      bedrijfs_grootte,
      locatie_adres,
      website,
      slogan,
      beschrijving,
      cultuur, // string of tags or csv
      contactpersoon_naam,
      contact_email,
    } = req.body || {}

    if (!bedrijfsnaam) return res.status(400).json({ error: 'bedrijfsnaam is verplicht' })

    const sql = `
      INSERT INTO company_profiles
        (user_id, bedrijfsnaam, kvk_nummer, sector, bedrijfs_grootte, locatie_adres, website, slogan, beschrijving, cultuur, contactpersoon_naam, contact_email)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        bedrijfsnaam = VALUES(bedrijfsnaam),
        kvk_nummer = VALUES(kvk_nummer),
        sector = VALUES(sector),
        bedrijfs_grootte = VALUES(bedrijfs_grootte),
        locatie_adres = VALUES(locatie_adres),
        website = VALUES(website),
        slogan = VALUES(slogan),
        beschrijving = VALUES(beschrijving),
        cultuur = VALUES(cultuur),
        contactpersoon_naam = VALUES(contactpersoon_naam),
        contact_email = VALUES(contact_email)
    `

    const params = [
      uid,
      bedrijfsnaam,
      kvk_nummer || null,
      sector || null,
      bedrijfs_grootte || null,
      locatie_adres || null,
      website || null,
      slogan || null,
      beschrijving || null,
      cultuur || null,
      contactpersoon_naam || null,
      contact_email || null,
    ]

    await query(sql, params)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('POST /api/company error:', err)
    return res.status(500).json({ error: 'Kon profiel niet opslaan' })
  }
})

export default router

