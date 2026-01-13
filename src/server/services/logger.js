import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { query } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOG_DIR = path.join(__dirname, '..', '..', '..', 'logs')
const LOG_FILE = path.join(LOG_DIR, 'system.log')

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true })
    }
  } catch (err) {
    console.error('[logger] Kan log map niet maken:', err)
  }
}

export async function logSystem(action, level = 'info', message = '', context = null) {
  ensureLogDir()
  const payload = {
    ts: new Date().toISOString(),
    level,
    action,
    message,
    context,
  }
  try {
    const line = JSON.stringify(payload)
    fs.appendFileSync(LOG_FILE, line + '\n', { encoding: 'utf8' })
  } catch (err) {
    console.error('[logger] Schrijven naar logbestand mislukt:', err)
  }

  try {
    await query(
      'INSERT INTO system_logs (level, action, message, context) VALUES (?,?,?,?)',
      [String(level || 'info'), String(action || 'unknown'), String(message || ''), context ? JSON.stringify(context) : null]
    )
  } catch (err) {
    console.error('[logger] Kon niet naar database loggen:', err)
  }
}

export default logSystem
