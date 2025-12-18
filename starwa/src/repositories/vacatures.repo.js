import pool from '../config/db.js';

export async function listVacatures({ q, dienstverband, actief, page = 1, limit = 10 }) {
  const filters = [];
  const params = [];

  if (q) {
    filters.push('(v.titel LIKE ? OR v.locatie LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (dienstverband) {
    filters.push('v.dienstverband = ?');
    params.push(dienstverband);
  }
  if (typeof actief === 'number') {
    filters.push('v.actief = ?');
    params.push(actief);
  }

  const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const sqlRows = `
    SELECT v.*, w.naam AS werkgever_naam
    FROM vacatures v
    JOIN werkgevers w ON w.id = v.werkgever_id
    ${where}
    ORDER BY v.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const sqlCount = `
    SELECT COUNT(*) AS cnt
    FROM vacatures v
    ${where}
  `;

  const [rows] = await pool.query(sqlRows, [...params, limit, offset]);
  const [countRows] = await pool.query(sqlCount, params);
  const total = countRows[0]?.cnt ?? 0;

  return { rows, total };
}

export async function getVacatureById(id) {
  const sql = `
    SELECT v.*, w.naam AS werkgever_naam
    FROM vacatures v
    JOIN werkgevers w ON w.id = v.werkgever_id
    WHERE v.id = ?
  `;
  const [rows] = await pool.query(sql, [id]);
  return rows[0] || null;
}

export async function createVacature(payload) {
  const sql = `
    INSERT INTO vacatures
      (werkgever_id, titel, beschrijving, locatie, dienstverband, salaris_min, salaris_max, actief, tags)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS JSON))
  `;

  const tagsJson = payload.tags ? JSON.stringify(payload.tags) : null;
  const params = [
    payload.werkgever_id,
    payload.titel,
    payload.beschrijving,
    payload.locatie,
    payload.dienstverband || 'fulltime',
    payload.salaris_min ?? null,
    payload.salaris_max ?? null,
    payload.actief ?? 1,
    tagsJson
  ];
  const [result] = await pool.query(sql, params);
  return getVacatureById(result.insertId);
}

export async function updateVacature(id, payload) {
  const fields = [];
  const params = [];

  const map = {
    werkgever_id: 'werkgever_id',
    titel: 'titel',
    beschrijving: 'beschrijving',
    locatie: 'locatie',
    dienstverband: 'dienstverband',
    salaris_min: 'salaris_min',
    salaris_max: 'salaris_max',
    actief: 'actief',
    tags: 'tags'
  };

  for (const [k, dbk] of Object.entries(map)) {
    if (typeof payload[k] !== 'undefined') {
      if (k === 'tags') {
        fields.push(`${dbk} = CAST(? AS JSON)`);
        params.push(payload[k] ? JSON.stringify(payload[k]) : null);
      } else {
        fields.push(`${dbk} = ?`);
        params.push(payload[k]);
      }
    }
  }

  if (!fields.length) return getVacatureById(id);

  const sql = `
    UPDATE vacatures SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;
  const [result] = await pool.query(sql, [...params, id]);
  if (result.affectedRows === 0) return null;
  return getVacatureById(id);
}

export async function deleteVacature(id) {
  const [result] = await pool.query('DELETE FROM vacatures WHERE id = ?', [id]);
  return result.affectedRows > 0;
}
