#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function main() {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node src/scripts/run-sql.js <sql-file>');
    process.exit(1);
  }

  const sqlPath = path.resolve(__dirname, '../../', fileArg);
  if (!fs.existsSync(sqlPath)) {
    console.error(`SQL file not found: ${sqlPath}`);
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlPath, 'utf8');
  const { DB_HOST, DB_USER, DB_PASS, DB_PORT } = process.env;

  const connection = await mysql.createConnection({
    host: DB_HOST || 'localhost',
    user: DB_USER || 'root',
    password: DB_PASS || '',
    port: DB_PORT ? Number(DB_PORT) : 3306,
    multipleStatements: true
  });

  try {
    await connection.query(sql);
    console.log(`Executed: ${fileArg}`);
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('SQL execution failed:', err.message);
  process.exit(1);
});

