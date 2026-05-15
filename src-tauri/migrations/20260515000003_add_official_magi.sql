-- 20260515000003_add_official_magi.sql
-- Add official flag to characters and seed data

ALTER TABLE characters ADD COLUMN is_official INTEGER NOT NULL DEFAULT 0;

-- Create an "Official" covenant to house them
INSERT OR IGNORE INTO covenants (id, name, aura_type, aura_level, founding_year, tribunal, size, description, is_official)
VALUES ('official-cov-id-0000', 'Doxa Hermetica', 'magic', 5, 1200, 'Greater Alps', 'medium', 'Covenant virtuel regroupant les magi de légende.', 1);

-- Seed Official Magi
INSERT INTO characters (id, covenant_id, name, character_type, house, birth_year, is_official)
VALUES 
('magus-001', 'official-cov-id-0000', 'Alexander of Jerbiton', 'magus', 'Jerbiton', 1199, 1),
('magus-002', 'official-cov-id-0000', 'Aurulentus of Jerbiton', 'magus', 'Jerbiton', 1180, 1),
('magus-003', 'official-cov-id-0000', 'Conscientia of Bonisagus', 'magus', 'Bonisagus', 1195, 1),
('magus-004', 'official-cov-id-0000', 'Gwidion of Verditius', 'magus', 'Verditius', 1185, 1),
('magus-005', 'official-cov-id-0000', 'Hugh of Flambeau', 'magus', 'Flambeau', 1192, 1),
('magus-006', 'official-cov-id-0000', 'Julia of Ex Miscellanea', 'magus', 'Ex Miscellanea', 1190, 1),
('magus-007', 'official-cov-id-0000', 'Lambert of Merinita', 'magus', 'Merinita', 1188, 1),
('magus-008', 'official-cov-id-0000', 'Maris of Tytalus', 'magus', 'Tytalus', 1193, 1),
('magus-009', 'official-cov-id-0000', 'Marcus of Criamon', 'magus', 'Criamon', 1187, 1),
('magus-010', 'official-cov-id-0000', 'Persephone of Tytalus', 'magus', 'Tytalus', 1194, 1),
('magus-011', 'official-cov-id-0000', 'Petalichus of Verditius', 'magus', 'Verditius', 1182, 1),
('magus-012', 'official-cov-id-0000', 'Ranulf of Flambeau', 'magus', 'Flambeau', 1196, 1),
('magus-013', 'official-cov-id-0000', 'Scipio of Merinita', 'magus', 'Merinita', 1197, 1),
('magus-014', 'official-cov-id-0000', 'Tolides of Flambeau', 'magus', 'Flambeau', 1198, 1),
('magus-015', 'official-cov-id-0000', 'Yestin of Jerbiton', 'magus', 'Jerbiton', 1191, 1);
