-- 20260515000005_add_official_grogs.sql
-- Seed Official Grogs (Serviteurs)

INSERT INTO characters (id, covenant_id, name, character_type, house, birth_year, is_official)
VALUES 
('grog-001', 'official-cov-id-0000', 'Bertram the Antesignanus', 'grog', 'Vanguard', 1195, 1),
('grog-002', 'official-cov-id-0000', 'Silas the Signifer', 'grog', 'Legate', 1190, 1),
('grog-003', 'official-cov-id-0000', 'Marta the Bodyguard', 'grog', 'Maidservant', 1202, 1),
('grog-004', 'official-cov-id-0000', 'Gerard the Laboratory Assistant', 'grog', 'Assistant', 1205, 1),
('grog-005', 'official-cov-id-0000', 'Old Tom the Watchman', 'grog', 'Sentry', 1185, 1),
('grog-006', 'official-cov-id-0000', 'Brother Paul the Scribe', 'grog', 'Scribe', 1198, 1);
