-- Add pages and site_settings tables for admin management
-- This script ensures the pages management feature works properly

-- Create pages table if it doesn't exist
CREATE TABLE IF NOT EXISTS pages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  is_published TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_published (is_published)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create site_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS site_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default site settings if they don't exist
INSERT IGNORE INTO site_settings (setting_key, setting_value) VALUES
  ('primaryColor', '#c4956f'),
  ('bgColor', '#f5e6d3'),
  ('logoText', 'Starwa'),
  ('siteTitle', 'TalentMatch');

-- Create default pages if they don't exist
INSERT IGNORE INTO pages (slug, title, content, is_published) VALUES
  ('about', 'Over Ons', '<h1>Over TalentMatch</h1><p>Welkom bij TalentMatch, jouw platform voor slim talent-matching.</p>', 1),
  ('contact', 'Contact', '<h1>Neem Contact Op</h1><p>Heb je vragen? Neem gerust contact met ons op!</p>', 1),
  ('privacy', 'Privacy Beleid', '<h1>Privacy Beleid</h1><p>Jouw privacy is belangrijk voor ons.</p>', 1);

-- Verify tables were created
SELECT 'Pages table created successfully' AS status;
SELECT 'Site settings table created successfully' AS status;
