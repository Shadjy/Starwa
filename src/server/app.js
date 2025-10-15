import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// CORS-instellingen
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000']

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Niet-toegestane CORS origin: ' + origin))
      }
    },
    credentials: true,
  })
)

// Routes
app.use('/api/auth', authRoutes)

// Statische bestanden uit de juiste map (client/)
app.use(express.static(path.join(__dirname, '..', 'client', 'pages')))
app.use('/css', express.static(path.join(__dirname, '..', 'client', 'css')))
app.use('/js', express.static(path.join(__dirname, '..', 'client', 'js')))

// Root: inlog/aanmeldpagina
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'pages', 'inlog-aanmeld.html'))
})

// Start de server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
