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

-- Extra nuttige indexen voor zoeken op role/email
CREATE INDEX `idx_users_role` ON `users` (`role`);
CREATE INDEX `idx_users_email_role` ON `users` (`email`, `role`);

-- Voorbeeldselectie voor debugging
-- SELECT `id`, `role`, `email`, `created_at` FROM `users` ORDER BY `created_at` DESC LIMIT 10;
