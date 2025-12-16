/*
 Navicat MySQL Dump SQL

 Source Server         : match
 Source Server Type    : MySQL
 Source Server Version : 80043 (8.0.43)
 Source Host           : 194.164.199.221:3306
 Source Schema         : match

 Target Server Type    : MySQL
 Target Server Version : 80043 (8.0.43)
 File Encoding         : 65001

 Date: 15/12/2025 12:59:01
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for company_profiles
-- ----------------------------
DROP TABLE IF EXISTS `company_profiles`;
CREATE TABLE `company_profiles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `bedrijfsnaam` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kvk_nummer` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sector` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bedrijfs_grootte` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locatie_adres` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `slogan` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beschrijving` text COLLATE utf8mb4_unicode_ci,
  `cultuur` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactpersoon_naam` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contact_email` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_company_user` (`user_id`),
  KEY `idx_company_sector` (`sector`),
  KEY `idx_company_grootte` (`bedrijfs_grootte`),
  CONSTRAINT `fk_company_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `receiver_user_id` int unsigned NOT NULL,
  `sender_user_id` int unsigned DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `related_id` int unsigned DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `read_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_message_dedup` (`receiver_user_id`,`type`,`related_id`),
  KEY `idx_messages_receiver` (`receiver_user_id`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for sollicitatie_thread_messages
-- ----------------------------
DROP TABLE IF EXISTS `sollicitatie_thread_messages`;
CREATE TABLE `sollicitatie_thread_messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `thread_id` int unsigned NOT NULL,
  `sender_user_id` int unsigned NOT NULL,
  `receiver_user_id` int unsigned NOT NULL,
  `type` varchar(48) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'general',
  `body` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_thread_messages_thread` (`thread_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for sollicitatie_threads
-- ----------------------------
DROP TABLE IF EXISTS `sollicitatie_threads`;
CREATE TABLE `sollicitatie_threads` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `sollicitatie_id` int unsigned NOT NULL,
  `archived` tinyint(1) NOT NULL DEFAULT '0',
  `archived_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_thread_sollicitatie` (`sollicitatie_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for sollicitaties
-- ----------------------------
DROP TABLE IF EXISTS `sollicitaties`;
CREATE TABLE `sollicitaties` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `werknemer_id` int unsigned NOT NULL,
  `werkgever_id` int unsigned NOT NULL,
  `vacature_id` int unsigned NOT NULL,
  `motivatie` mediumtext COLLATE utf8mb4_unicode_ci,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ingediend',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sollicitatie_unique` (`werknemer_id`,`vacature_id`),
  KEY `idx_sollicitatie_vacature` (`vacature_id`),
  KEY `idx_sollicitatie_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for system_logs
-- ----------------------------
DROP TABLE IF EXISTS `system_logs`;
CREATE TABLE `system_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `level` varchar(16) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `action` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `context` json DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_system_logs_action` (`action`),
  KEY `idx_system_logs_level` (`level`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `role` enum('seeker','employer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `naam` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactpersoon` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bedrijfsnaam` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bedrijfsGrootte` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_email_role` (`email`,`role`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for vacancies
-- ----------------------------
DROP TABLE IF EXISTS `vacancies`;
CREATE TABLE `vacancies` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `employer_id` int unsigned DEFAULT NULL,
  `company_profile_id` int unsigned DEFAULT NULL,
  `functietitel` varchar(160) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categorie` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locatie` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dienstverband` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uren_per_week` smallint unsigned DEFAULT NULL,
  `salaris_min` int unsigned DEFAULT NULL,
  `salaris_max` int unsigned DEFAULT NULL,
  `opleidingsniveau` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ervaring_jaren` smallint unsigned DEFAULT NULL,
  `vaardigheden` text COLLATE utf8mb4_unicode_ci,
  `omschrijving` mediumtext COLLATE utf8mb4_unicode_ci,
  `startdatum` date DEFAULT NULL,
  `posities` smallint unsigned DEFAULT NULL,
  `contractduur` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contactpersoon` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_vacancies_employer` (`employer_id`),
  KEY `fk_vacancies_company` (`company_profile_id`),
  KEY `idx_vacancies_filters` (`functietitel`,`categorie`,`locatie`,`dienstverband`,`opleidingsniveau`),
  KEY `idx_vacancies_experience` (`ervaring_jaren`),
  CONSTRAINT `fk_vacancies_company` FOREIGN KEY (`company_profile_id`) REFERENCES `company_profiles` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_vacancies_employer` FOREIGN KEY (`employer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Table structure for candidates_info
-- ----------------------------
DROP TABLE IF EXISTS `candidates_info`;
CREATE TABLE `candidates_info` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `naam` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `huidige_functie` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gewilde_functie` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `locatie` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `beschikbaarheid` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contracttype` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sector` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uren_per_week` smallint unsigned DEFAULT NULL,
  `salarisindicatie` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vaardigheden` text COLLATE utf8mb4_unicode_ci,
  `cv_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `portfolio_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `github_link` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `talen` json DEFAULT NULL,
  `ervaring` text COLLATE utf8mb4_unicode_ci,
  `email_adres` varchar(160) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefoonnummer` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notities` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_candidates_user` (`user_id`),
  KEY `idx_candidates_locatie` (`locatie`),
  KEY `idx_candidates_sector` (`sector`),
  CONSTRAINT `fk_candidates_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
