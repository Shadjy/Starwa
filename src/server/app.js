import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


const CLIENT_DIR = path.join(__dirname, '..', 'client')
const PAGES_DIR  = path.join(CLIENT_DIR, 'pages')

function sendHtml(res, absPath) {
  if (fs.existsSync(absPath)) return res.sendFile(absPath)
  return res.status(404).send(`<h1>404</h1><p>Niet gevonden: ${absPath}</p>`)
}

const app = express()
const PORT = process.env.PORT || 3000


app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(express.static(CLIENT_DIR))


app.use('/api/auth', authRoutes)


app.get('/', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'inlog-aanmeld.html'))
})


app.get('/dashboard', (_req, res) => {
  sendHtml(res, path.join(PAGES_DIR, 'dashboard.html'))
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
  console.error('Server error:', err?.stack || err)
  res.status(500).json({ error: 'Interne serverfout' })
})

// Start
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`)
  console.log(`CLIENT_DIR: ${CLIENT_DIR}`)
  console.log(`PAGES_DIR : ${PAGES_DIR}`)
  console.log('Home: / → src/client/pages/inlog-aanmeld.html')
})
