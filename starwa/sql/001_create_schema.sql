CREATE DATABASE IF NOT EXISTS starwa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE starwa;

-- Drop old tables to ensure correct schema
SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS vacatures;
DROP TABLE IF EXISTS werkgevers;
SET FOREIGN_KEY_CHECKS=1;

-- Werkgevers
CREATE TABLE IF NOT EXISTS werkgevers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  telefoon VARCHAR(40) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vacatures
CREATE TABLE IF NOT EXISTS vacatures (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  werkgever_id INT UNSIGNED NOT NULL,
  titel VARCHAR(180) NOT NULL,
  beschrijving TEXT NOT NULL,
  locatie VARCHAR(120) NOT NULL,
  dienstverband ENUM('fulltime','parttime','zzp','stage') NOT NULL DEFAULT 'fulltime',
  salaris_min INT NULL,
  salaris_max INT NULL,
  actief TINYINT(1) NOT NULL DEFAULT 1,
  tags JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vacatures_werkgever FOREIGN KEY (werkgever_id) REFERENCES werkgevers(id) ON DELETE CASCADE,
  INDEX idx_vacatures_titel_locatie_dienstverband (titel, locatie, dienstverband)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
