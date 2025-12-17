import { query } from '../db.js'
import { logSystem } from '../services/logger.js'

async function ensureTables() {
  // Minimal runtime migrations to avoid 500s when schema.sql niet is gedraaid
  const stmts = [
    `CREATE TABLE IF NOT EXISTS user_profiles (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      phone VARCHAR(64) DEFAULT NULL,
      address VARCHAR(255) DEFAULT NULL,
      city VARCHAR(160) DEFAULT NULL,
      degree VARCHAR(160) DEFAULT NULL,
      work_experience VARCHAR(64) DEFAULT NULL,
      work_wishes TEXT DEFAULT NULL,
      work_location VARCHAR(160) DEFAULT NULL,
      work_hours VARCHAR(64) DEFAULT NULL,
      avatar_url VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_profile_user (user_id),
      CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS sollicitaties (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      werknemer_id INT UNSIGNED NOT NULL,
      werkgever_id INT UNSIGNED NOT NULL,
      vacature_id INT UNSIGNED NOT NULL,
      motivatie MEDIUMTEXT DEFAULT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'ingediend',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_sollicitatie_unique (werknemer_id, vacature_id),
      KEY idx_sollicitatie_vacature (vacature_id),
      KEY idx_sollicitatie_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS messages (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      receiver_user_id INT UNSIGNED NOT NULL,
      sender_user_id INT UNSIGNED DEFAULT NULL,
      title VARCHAR(255) NOT NULL,
      body MEDIUMTEXT NOT NULL,
      type VARCHAR(64) NOT NULL,
      related_id INT UNSIGNED DEFAULT NULL,
      metadata JSON DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      read_at TIMESTAMP NULL DEFAULT NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_message_dedup (receiver_user_id, type, related_id),
      KEY idx_messages_receiver (receiver_user_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS system_logs (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      level VARCHAR(16) NOT NULL DEFAULT 'info',
      action VARCHAR(120) NOT NULL,
      message TEXT NOT NULL,
      context JSON DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_system_logs_action (action),
      KEY idx_system_logs_level (level)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS sollicitatie_threads (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      sollicitatie_id INT UNSIGNED NOT NULL,
      archived TINYINT(1) NOT NULL DEFAULT 0,
      archived_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_thread_sollicitatie (sollicitatie_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    `CREATE TABLE IF NOT EXISTS sollicitatie_thread_messages (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      thread_id INT UNSIGNED NOT NULL,
      sender_user_id INT UNSIGNED NOT NULL,
      receiver_user_id INT UNSIGNED NOT NULL,
      type VARCHAR(48) NOT NULL DEFAULT 'general',
      body MEDIUMTEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_thread_messages_thread (thread_id, created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ]
  for (const sql of stmts) {
    try {
      await query(sql)
    } catch (err) {
      await logSystem('bootstrap_error', 'error', 'Schema bootstrap faalde', { sql, error: err?.message })
      console.error('[schema bootstrap] error executing:', sql, err)
    }
  }
  await logSystem('bootstrap_ok', 'info', 'Schema bootstrap afgerond')
}

export default ensureTables
