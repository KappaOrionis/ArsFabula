-- 20260516000001_add_covenant_visuals.sql
-- Add visual_path column to covenants table and map all 26 covenants to their high-quality archetype visuals

ALTER TABLE covenants ADD COLUMN visual_path TEXT;

UPDATE covenants SET visual_path = '/covenants/cov_black_forest_citadel.png' WHERE id = 'cov-durenmar-0000';
UPDATE covenants SET visual_path = '/covenants/cov_fengheld_promontory.png' WHERE id = 'cov-fengheld-0000';
UPDATE covenants SET visual_path = '/covenants/cov_coeris_citadel.png' WHERE id = 'cov-coeris-0000';
UPDATE covenants SET visual_path = '/covenants/cov_blackthorn_fortress.png' WHERE id = 'cov-blackthorn-0000';

UPDATE covenants SET visual_path = '/covenants/cov_mountain_fortress.png' WHERE id IN ('cov-doissetep-0000', 'cov-horsinglas-0000');
UPDATE covenants SET visual_path = '/covenants/cov_valnegra_ruins.png' WHERE id = 'cov-valnegra-0000';
UPDATE covenants SET visual_path = '/covenants/cov_kastellon_pass.png' WHERE id = 'cov-kastellon-0000';

UPDATE covenants SET visual_path = '/covenants/cov_ancient_forest_shrine.png' WHERE id = 'cov-crintera-0000';
UPDATE covenants SET visual_path = '/covenants/cov_ashenrise_sanctuary.png' WHERE id = 'cov-ashenrise-0000';
UPDATE covenants SET visual_path = '/covenants/cov_krasnorechye_ostrog.png' WHERE id = 'cov-krasnorechye-0000';

UPDATE covenants SET visual_path = '/covenants/cov_faerie_glade_palace.png' WHERE id = 'cov-irencilia-0000';
UPDATE covenants SET visual_path = '/covenants/cov_coastal_storm_fortress.png' WHERE id IN ('cov-fudarus-0000', 'cov-exspectatio-0000', 'cov-semitae-0000');
UPDATE covenants SET visual_path = '/covenants/cov_roman_villa_estate.png' WHERE id IN ('cov-harco-0000', 'cov-favras-0000', 'cov-magvillus-0000');
UPDATE covenants SET visual_path = '/covenants/cov_magical_forge_cavern.png' WHERE id IN ('cov-verdi-0000', 'cov-twisting-0000');
UPDATE covenants SET visual_path = '/covenants/cov_renaissance_manor.png' WHERE id IN ('cov-levrier-0000', 'cov-valnastium-0000', 'cov-pythagoranis-0000');
UPDATE covenants SET visual_path = '/covenants/cov_moorish_palace.png' WHERE id IN ('cov-jaferia-0000', 'cov-castrasolis-0000');
UPDATE covenants SET visual_path = '/covenants/cov_crusader_crypt.png' WHERE id = 'cov-acre-0000';
