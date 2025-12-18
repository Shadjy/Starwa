import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'node:path';
import url from 'node:url';

// Ensure env is loaded even when this module is imported before server.js runs dotenv.config()
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'starwa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Quick connectivity check on module load (logs only in dev)
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      const [rows] = await pool.query('SELECT 1 AS ok');
      // eslint-disable-next-line no-console
      console.log('[db] Connected:', process.env.DB_HOST, 'db:', process.env.DB_NAME, 'ok:', rows[0]?.ok);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[db] Connection failed:', {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        name: process.env.DB_NAME,
        code: err.code,
        errno: err.errno,
        message: err.message
      });
    }
  })();
}

export default pool;
