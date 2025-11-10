import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// Load .env: prefer repo root, fallback to server/.env
const ROOT_ENV = path.join(__dirname, '..', '..', '.env')
const SERVER_ENV = path.join(__dirname, '.env')
try {
  if (fs.existsSync(ROOT_ENV)) dotenv.config({ path: ROOT_ENV })
  if (!process.env.DB_HOST && fs.existsSync(SERVER_ENV)) dotenv.config({ path: SERVER_ENV })
} catch {}

const useSSL = (process.env.DB_SSL || '').toLowerCase() === 'true' || (process.env.DB_SSL || '').toLowerCase() === 'skip-verify'
const strictSSL = (process.env.DB_SSL || '').toLowerCase() === 'true'
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 15000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  ssl: useSSL ? { rejectUnauthorized: strictSSL } : undefined,
})

export async function query(sql, params = []) {
  const [rows] = await pool.execute(sql, params)
  return rows
}

export async function getConnection() {
  return pool.getConnection()
}

export default pool
