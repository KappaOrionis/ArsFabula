-- 20260515000004_add_official_companions.sql
-- Seed Official Companions (Custodes)

INSERT INTO characters (id, covenant_id, name, character_type, house, birth_year, is_official)
VALUES 
('companion-001', 'official-cov-id-0000', 'Kore', 'companion', 'Tytalus (Affin)', 1200, 1),
('companion-002', 'official-cov-id-0000', 'Guy de Provence', 'companion', 'Noble', 1195, 1),
('companion-003', 'official-cov-id-0000', 'Brother Thomas', 'companion', 'Clergy', 1190, 1),
('companion-004', 'official-cov-id-0000', 'Elena the Mercenary', 'companion', 'Soldier', 1198, 1),
('companion-005', 'official-cov-id-0000', 'Lucas the Merchant', 'companion', 'Trader', 1192, 1);
