USE starwa;

INSERT INTO werkgevers (naam, email, telefoon)
VALUES ('Starwa BV', 'hr@starwa.local', '010-1234567');

-- Voorbeeldvacatures
INSERT INTO vacatures (werkgever_id, titel, beschrijving, locatie, dienstverband, salaris_min, salaris_max, actief, tags)
VALUES
  (1, 'Frontend Developer', 'Bouw moderne, toegankelijke UI met onze design tokens en toolchain.', 'Rotterdam', 'fulltime', 3000, 4200, 1, JSON_ARRAY('ui', 'javascript', 'css')),
  (1, 'Backend Developer (Node.js)', 'Ontwerp en onderhoud REST APIs met Node.js/Express en MySQL.', 'Amsterdam', 'parttime', 3500, 5000, 1, JSON_ARRAY('node', 'express', 'mysql'));

