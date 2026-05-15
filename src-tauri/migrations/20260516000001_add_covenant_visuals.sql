-- 20260516000001_add_covenant_visuals.sql
-- Add visual_path column to covenants table and map all 26 covenants to their high-quality archetype visuals

ALTER TABLE covenants ADD COLUMN visual_path TEXT;

UPDATE covenants SET visual_path = '/covenants/cov_durenmar_citadel.png' WHERE id = 'cov-durenmar-0000';
UPDATE covenants SET visual_path = '/covenants/cov_fengheld_promontory.png' WHERE id = 'cov-fengheld-0000';
UPDATE covenants SET visual_path = '/covenants/cov_coeris_citadel.png' WHERE id = 'cov-coeris-0000';
UPDATE covenants SET visual_path = '/covenants/cov_blackthorn_fortress.png' WHERE id = 'cov-blackthorn-0000';

UPDATE covenants SET visual_path = '/covenants/cov_doissetep_fortress.png' WHERE id = 'cov-doissetep-0000';
UPDATE covenants SET visual_path = '/covenants/cov_valnegra_ruins.png' WHERE id = 'cov-valnegra-0000';
UPDATE covenants SET visual_path = '/covenants/cov_kastellon_pass.png' WHERE id = 'cov-kastellon-0000';
UPDATE covenants SET visual_path = '/covenants/cov_horsinglas_broch.png' WHERE id = 'cov-horsinglas-0000';

UPDATE covenants SET visual_path = '/covenants/cov_crintera_shrine.png' WHERE id = 'cov-crintera-0000';
UPDATE covenants SET visual_path = '/covenants/cov_ashenrise_sanctuary.png' WHERE id = 'cov-ashenrise-0000';
UPDATE covenants SET visual_path = '/covenants/cov_krasnorechye_ostrog.png' WHERE id = 'cov-krasnorechye-0000';

UPDATE covenants SET visual_path = '/covenants/cov_irencilia_palace.png' WHERE id = 'cov-irencilia-0000';

UPDATE covenants SET visual_path = '/covenants/cov_fudarus_fortress.png' WHERE id = 'cov-fudarus-0000';
UPDATE covenants SET visual_path = '/covenants/cov_exspectatio_cliffs.png' WHERE id = 'cov-exspectatio-0000';
UPDATE covenants SET visual_path = '/covenants/cov_semitae_weather_tower.png' WHERE id = 'cov-semitae-0000';

UPDATE covenants SET visual_path = '/covenants/cov_harco_villa.png' WHERE id = 'cov-harco-0000';
UPDATE covenants SET visual_path = '/covenants/cov_favras_citadel.png' WHERE id = 'cov-favras-0000';
UPDATE covenants SET visual_path = '/covenants/cov_magvillus_palace.png' WHERE id = 'cov-magvillus-0000';

UPDATE covenants SET visual_path = '/covenants/cov_verdi_forge.png' WHERE id = 'cov-verdi-0000';
UPDATE covenants SET visual_path = '/covenants/cov_twisting_shadows.png' WHERE id = 'cov-twisting-0000';

UPDATE covenants SET visual_path = '/covenants/cov_levrier_manor.png' WHERE id = 'cov-levrier-0000';
UPDATE covenants SET visual_path = '/covenants/cov_valnastium_palace.png' WHERE id = 'cov-valnastium-0000';
UPDATE covenants SET visual_path = '/covenants/cov_pythagoranis_schola.png' WHERE id = 'cov-pythagoranis-0000';

UPDATE covenants SET visual_path = '/covenants/cov_jaferia_palace.png' WHERE id = 'cov-jaferia-0000';
UPDATE covenants SET visual_path = '/covenants/cov_castrasolis_arena.png' WHERE id = 'cov-castrasolis-0000';

UPDATE covenants SET visual_path = '/covenants/cov_acre_crypt.png' WHERE id = 'cov-acre-0000';
