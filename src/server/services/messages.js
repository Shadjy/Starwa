import { query } from '../db.js'
import { logSystem } from './logger.js'

function parseJson(val) {
  if (val == null) return null
  if (typeof val === 'object') return val
  const raw = Buffer.isBuffer(val) ? val.toString('utf8') : String(val)
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function createMessage({
  receiver_user_id,
  sender_user_id = null,
  title,
  body,
  type,
  related_id = null,
  metadata = null,
}) {
  const metaString = metadata ? JSON.stringify(metadata) : null
  try {
    const result = await query(
      `INSERT INTO messages (receiver_user_id, sender_user_id, title, body, type, related_id, metadata)
       VALUES (?,?,?,?,?,?,?)`,
      [receiver_user_id, sender_user_id, title, body, type, related_id, metaString]
    )
    await logSystem('message_created', 'info', `Message ${result.insertId} created`, {
      receiver_user_id,
      sender_user_id,
      type,
      related_id,
    })
    return result.insertId
  } catch (err) {
    if (err?.code === 'ER_DUP_ENTRY') {
      await logSystem('message_dedup', 'warning', 'Duplicate message skipped', {
        receiver_user_id,
        related_id,
        type,
      })
      return null
    }
    await logSystem('message_error', 'error', 'Failed to create message', {
      receiver_user_id,
      related_id,
      type,
      error: err?.message,
    })
    throw err
  }
}

export async function listMessagesForUser(userId, { limit = 100 } = {}) {
  const lim = Math.max(1, Math.min(Number(limit) || 100, 500))
  const rows = await query(
    `SELECT id, receiver_user_id, sender_user_id, title, body, type, related_id, metadata, created_at, read_at
     FROM messages
     WHERE receiver_user_id = ?
     ORDER BY created_at DESC
     LIMIT ${lim}`,
    [userId]
  )
  return rows.map(row => ({
    ...row,
    metadata: parseJson(row.metadata),
    read: !!row.read_at,
  }))
}

export async function markMessageRead(id, userId, read = true) {
  const ts = read ? new Date() : null
  await query(
    `UPDATE messages SET read_at = ? WHERE id = ? AND receiver_user_id = ?`,
    [ts ? ts.toISOString().slice(0, 19).replace('T', ' ') : null, id, userId]
  )
  await logSystem('message_mark', 'info', 'Message read/unread toggled', { id, userId, read })
}

export default {
  createMessage,
  listMessagesForUser,
  markMessageRead,
}
