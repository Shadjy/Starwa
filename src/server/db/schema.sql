-- DATABASE EN TABELSTRUCTUUR VOOR STARWA AUTH (IMPORT VIA MYSQL)

-- Maak de database als deze nog niet bestaat
CREATE DATABASE IF NOT EXISTS `match` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `match`;

-- Verwijder bestaande tabel optioneel (kommentarieer uit als je bestaande data wilt behouden)
-- DROP TABLE IF EXISTS `users`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role` ENUM('seeker', 'employer') NOT NULL,
  `naam` VARCHAR(120) DEFAULT NULL,
  `contactpersoon` VARCHAR(120) DEFAULT NULL,
  `bedrijfsnaam` VARCHAR(160) DEFAULT NULL,
  `bedrijfsGrootte` VARCHAR(32) DEFAULT NULL,
  `email` VARCHAR(160) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Extra nuttige indexen voor zoeken op role/email (idempotent)
SET @idx_users_role := (
  SELECT COUNT(1) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_role'
);
SET @sql_users_role := IF(@idx_users_role = 0,
  'CREATE INDEX `idx_users_role` ON `users` (`role`)',
  'SELECT 1');
PREPARE stmt FROM @sql_users_role; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_users_email_role := (
  SELECT COUNT(1) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_email_role'
);
SET @sql_users_email_role := IF(@idx_users_email_role = 0,
  'CREATE INDEX `idx_users_email_role` ON `users` (`email`, `role`)',
  'SELECT 1');
PREPARE stmt FROM @sql_users_email_role; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Voorbeeldselectie voor debugging
-- SELECT `id`, `role`, `email`, `created_at` FROM `users` ORDER BY `created_at` DESC LIMIT 10;

-- Werkgever bedrijfsprofiel (Vragenlijst)
CREATE TABLE IF NOT EXISTS `company_profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `bedrijfsnaam` VARCHAR(160) NOT NULL,
  `kvk_nummer` VARCHAR(32) DEFAULT NULL,
  `sector` VARCHAR(80) DEFAULT NULL,
  `bedrijfs_grootte` VARCHAR(32) DEFAULT NULL,
  `locatie_adres` VARCHAR(255) DEFAULT NULL,
  `website` VARCHAR(255) DEFAULT NULL,
  `slogan` VARCHAR(255) DEFAULT NULL,
  `beschrijving` TEXT,
  `cultuur` VARCHAR(120) DEFAULT NULL,
  `contactpersoon_naam` VARCHAR(120) DEFAULT NULL,
  `contact_email` VARCHAR(160) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_user` (`user_id`),
  CONSTRAINT `fk_company_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Idempotente indexen voor company_profiles
SET @idx_company_sector := (
  SELECT COUNT(1) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'company_profiles' AND INDEX_NAME = 'idx_company_sector'
);
SET @sql_company_sector := IF(@idx_company_sector = 0,
  'CREATE INDEX `idx_company_sector` ON `company_profiles` (`sector`)',
  'SELECT 1');
PREPARE stmt FROM @sql_company_sector; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_company_grootte := (
  SELECT COUNT(1) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'company_profiles' AND INDEX_NAME = 'idx_company_grootte'
);
SET @sql_company_grootte := IF(@idx_company_grootte = 0,
  'CREATE INDEX `idx_company_grootte` ON `company_profiles` (`bedrijfs_grootte`)',
  'SELECT 1');
PREPARE stmt FROM @sql_company_grootte; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Vacatures (Werkgever)
CREATE TABLE IF NOT EXISTS `vacancies` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `employer_id` INT UNSIGNED NULL, -- verwijst idealiter naar users.id met role='employer'
  `company_profile_id` INT UNSIGNED NULL,
  `functietitel` VARCHAR(160) NOT NULL,
  `categorie` VARCHAR(80) DEFAULT NULL,
  `locatie` VARCHAR(160) DEFAULT NULL,
  `dienstverband` VARCHAR(32) DEFAULT NULL, -- Fulltime/Parttime/etc.
  `uren_per_week` SMALLINT UNSIGNED DEFAULT NULL,
  `salaris_min` INT UNSIGNED DEFAULT NULL,
  `salaris_max` INT UNSIGNED DEFAULT NULL,
  `opleidingsniveau` VARCHAR(64) DEFAULT NULL,
  `ervaring_jaren` SMALLINT UNSIGNED DEFAULT NULL,
  `vaardigheden` TEXT DEFAULT NULL, -- JSON string of tags
  `omschrijving` MEDIUMTEXT DEFAULT NULL,
  `startdatum` DATE DEFAULT NULL,
  `posities` SMALLINT UNSIGNED DEFAULT NULL,
  `contractduur` VARCHAR(40) DEFAULT NULL, -- Tijdelijk/Vast/etc.
  `contactpersoon` VARCHAR(120) DEFAULT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_vacancies_employer` FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vacancies_company` FOREIGN KEY (`company_profile_id`) REFERENCES `company_profiles` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Idempotente indexen voor vacancies
SET @idx_vacancies_filters := (
  SELECT COUNT(1) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vacancies' AND INDEX_NAME = 'idx_vacancies_filters'
);
SET @sql_vacancies_filters := IF(@idx_vacancies_filters = 0,
  'CREATE INDEX `idx_vacancies_filters` ON `vacancies` (`functietitel`, `categorie`, `locatie`, `dienstverband`, `opleidingsniveau`)',
  'SELECT 1');
PREPARE stmt FROM @sql_vacancies_filters; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_vacancies_experience := (
  SELECT COUNT(1) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vacancies' AND INDEX_NAME = 'idx_vacancies_experience'
);
SET @sql_vacancies_experience := IF(@idx_vacancies_experience = 0,
  'CREATE INDEX `idx_vacancies_experience` ON `vacancies` (`ervaring_jaren`)',
  'SELECT 1');
PREPARE stmt FROM @sql_vacancies_experience; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Voeg kolom is_active toe indien die nog niet bestaat (idempotent)
SET @col_vacancies_is_active := (
  SELECT COUNT(1) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'vacancies' AND COLUMN_NAME = 'is_active'
);
SET @sql_vacancies_is_active := IF(@col_vacancies_is_active = 0,
  'ALTER TABLE `vacancies` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `contactpersoon`',
  'SELECT 1');
PREPARE stmt FROM @sql_vacancies_is_active; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Sollicitaties van werknemers op vacatures
CREATE TABLE IF NOT EXISTS `sollicitaties` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `werknemer_id` INT UNSIGNED NOT NULL,
  `werkgever_id` INT UNSIGNED NOT NULL,
  `vacature_id` INT UNSIGNED NOT NULL,
  `motivatie` MEDIUMTEXT DEFAULT NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'ingediend',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sollicitatie_unique` (`werknemer_id`, `vacature_id`),
  KEY `idx_sollicitatie_vacature` (`vacature_id`),
  KEY `idx_sollicitatie_status` (`status`),
  CONSTRAINT `fk_sollicitatie_werknemer` FOREIGN KEY (`werknemer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sollicitatie_werkgever` FOREIGN KEY (`werkgever_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sollicitatie_vacature` FOREIGN KEY (`vacature_id`) REFERENCES `vacancies` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Berichten inbox
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `receiver_user_id` INT UNSIGNED NOT NULL,
  `sender_user_id` INT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` MEDIUMTEXT NOT NULL,
  `type` VARCHAR(64) NOT NULL,
  `related_id` INT UNSIGNED DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_message_dedup` (`receiver_user_id`, `type`, `related_id`),
  KEY `idx_messages_receiver` (`receiver_user_id`, `created_at`),
  CONSTRAINT `fk_messages_receiver` FOREIGN KEY (`receiver_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- System logging (backend acties / events)
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `level` VARCHAR(16) NOT NULL DEFAULT 'info',
  `action` VARCHAR(120) NOT NULL,
  `message` TEXT NOT NULL,
  `context` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_system_logs_action` (`action`),
  KEY `idx_system_logs_level` (`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Gespreksdossier per sollicitatie
CREATE TABLE IF NOT EXISTS `sollicitatie_threads` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sollicitatie_id` INT UNSIGNED NOT NULL,
  `archived` TINYINT(1) NOT NULL DEFAULT 0,
  `archived_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_thread_sollicitatie` (`sollicitatie_id`),
  CONSTRAINT `fk_thread_sollicitatie` FOREIGN KEY (`sollicitatie_id`) REFERENCES `sollicitaties` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sollicitatie_thread_messages` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `thread_id` INT UNSIGNED NOT NULL,
  `sender_user_id` INT UNSIGNED NOT NULL,
  `receiver_user_id` INT UNSIGNED NOT NULL,
  `type` VARCHAR(48) NOT NULL DEFAULT 'general', -- general | info | invite | interview
  `body` MEDIUMTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_thread_messages_thread` (`thread_id`, `created_at`),
  CONSTRAINT `fk_thread_message_thread` FOREIGN KEY (`thread_id`) REFERENCES `sollicitatie_threads` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_thread_message_sender` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_thread_message_receiver` FOREIGN KEY (`receiver_user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
