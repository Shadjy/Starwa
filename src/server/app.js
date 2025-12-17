import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.js'
import vacaturesRoutes from './routes/vacatures.js'
import companyRoutes from './routes/company.js'
import candidatesRoutes from './routes/candidates.js'
import sollicitatiesRoutes from './routes/sollicitaties.js'
import berichtenRoutes from './routes/berichten.js'
import profileRoutes from './routes/profile.js'
import bus from './events/bus.js'
import { registerSollicitatieListeners } from './events/sollicitatie.js'
import ensureTables from './db/bootstrap.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load .env: prefer repo root, fallback to server/.env
const ROOT_ENV = path.join(__dirname, '..', '..', '.env')
const SERVER_ENV = path.join(__dirname, '.env')
try {
  if (fs.existsSync(ROOT_ENV)) dotenv.config({ path: ROOT_ENV })
  if (!process.env.DB_HOST && fs.existsSync(SERVER_ENV)) dotenv.config({ path: SERVER_ENV })
} catch {}


const CLIENT_DIR = path.join(__dirname, '..', 'client')
const PAGES_DIR  = path.join(CLIENT_DIR, 'pages')

function sendHtml(res, absPath) {
  if (fs.existsSync(absPath)) return res.sendFile(absPath)
  return res.status(404).send(`<h1>404</h1><p>Niet gevonden: ${absPath}</p>`)
}

const app = express()
const PORT = process.env.PORT || 3000


app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser(process.env.SESSION_SECRET || 'starwa-dev-secret'))

app.use(express.static(CLIENT_DIR))


app.use('/api/auth', authRoutes)
app.use('/api/vacatures', vacaturesRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/candidates', candidatesRoutes)
app.use('/api/sollicitaties', sollicitatiesRoutes)
app.use('/api/berichten', berichtenRoutes)
app.use('/api/profile', profileRoutes)
// Events listeners
registerSollicitatieListeners(bus)
// Idempotent bootstrap voor tabellen (voor demo/dev)
ensureTables().catch(err => console.error('Schema bootstrap failed:', err))


app.get('/', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'home.html'))
})

app.get('/home', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'home.html'))
})

app.get('/inlog-aanmeld', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'inlog-aanmeld.html'))
})


app.get('/dashboard', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'match.html'))
})

app.get('/dashboard-werkgever', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'dashboard-werkgever.html'))
})

app.get('/vragenlijst', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'vragenlijst.html'))
})

app.get('/profiel', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'profiel.html'))
})

app.get('/berichten', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'berichten.html'))
})

app.get('/match', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'match.html'))
})

app.get('/matches', (_req, res) => res.redirect(301, '/match'))


app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Niet gevonden' })
  }
  res.status(404).send('<h1>404</h1><a href="/">Terug naar inloggen</a>')
})


app.use((err, _req, res, _next) => {
  const payload = { error: 'Interne serverfout' }
  if (process.env.NODE_ENV !== 'production') {
    payload.details = String(err?.message || err)
    if (err && typeof err === 'object') {
      payload.code = err.code
      payload.sqlMessage = err.sqlMessage
      payload.sqlState = err.sqlState
      payload.name = err.name
    }
  }
  console.error('Server error:', err?.stack || err)
  res.status(500).json(payload)
})

// Start
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
  console.log(`CLIENT_DIR: ${CLIENT_DIR}`)
  console.log(`PAGES_DIR : ${PAGES_DIR}`)
  console.log('Home: / -> ' + path.join(PAGES_DIR, 'home.html'))
})
// Debug: DB ping (dev only)
import { query as dbQuery } from './db.js'
if (process.env.NODE_ENV !== 'production') {
  app.get('/api/debug/ping', async (_req, res) => {
    try {
      const rows = await dbQuery('SELECT 1 AS ok')
      res.json({ ok: rows?.[0]?.ok === 1 })
    } catch (err) {
      res.status(500).json({ error: 'db_error', details: String(err?.message || err) })
    }
  })
}

// DB self-test bij start (logt configuratie en ping resultaat)
const { DB_HOST, DB_PORT, DB_USER, DB_NAME, DB_SSL } = process.env
console.log('[DB] Config (zonder wachtwoord):', {
  host: DB_HOST,
  port: Number(DB_PORT) || 3306,
  user: DB_USER,
  database: DB_NAME,
  ssl: DB_SSL || 'off',
})
;(async () => {
  try {
    const rows = await dbQuery('SELECT 1 AS ok')
    if (rows?.[0]?.ok === 1) console.log('[DB] Verbinding OK')
    else console.log('[DB] Onverwachte ping-respons:', rows)
  } catch (err) {
    console.error('[DB] Verbinding FOUT:', {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      sqlMessage: err?.sqlMessage,
      sqlState: err?.sqlState,
    })
    console.error('[DB] Tip: controleer firewall/GRANTs/bind-address/SSL en .env waarden.')
  }
})()
