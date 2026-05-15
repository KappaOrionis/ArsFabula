-- 20260516000002_add_character_visuals.sql
-- Add visual_path column to characters table and map unique visuals for magi with physical descriptions

ALTER TABLE characters ADD COLUMN visual_path TEXT;

-- 1. Default all characters to unknown.png
UPDATE characters SET visual_path = '/characters/unknown.png';

-- 2. Update the 36 unique canonical magi with their specific visual paths
UPDATE characters SET visual_path = '/characters/char_darius.png' WHERE id = 'magus-census-0001';
UPDATE characters SET visual_path = '/characters/char_alexander.png' WHERE id = 'magus-census-0002';
UPDATE characters SET visual_path = '/characters/char_gideon.png' WHERE id = 'magus-census-0003';
UPDATE characters SET visual_path = '/characters/char_aururentius.png' WHERE id = 'magus-census-0004';
UPDATE characters SET visual_path = '/characters/char_conna.png' WHERE id = 'magus-census-0005';
UPDATE characters SET visual_path = '/characters/char_gaston.png' WHERE id = 'magus-census-0006';
UPDATE characters SET visual_path = '/characters/char_gora.png' WHERE id = 'magus-census-0007';
UPDATE characters SET visual_path = '/characters/char_julia.png' WHERE id = 'magus-census-0008';
UPDATE characters SET visual_path = '/characters/char_lambert.png' WHERE id = 'magus-census-0009';
UPDATE characters SET visual_path = '/characters/char_maris.png' WHERE id = 'magus-census-0010';
UPDATE characters SET visual_path = '/characters/char_muscaria.png' WHERE id = 'magus-census-0011';
UPDATE characters SET visual_path = '/characters/char_petalichus.png' WHERE id = 'magus-census-0012';
UPDATE characters SET visual_path = '/characters/char_ranulf.png' WHERE id = 'magus-census-0013';
UPDATE characters SET visual_path = '/characters/char_scipio.png' WHERE id = 'magus-census-0014';
UPDATE characters SET visual_path = '/characters/char_tolides.png' WHERE id = 'magus-census-0015';
UPDATE characters SET visual_path = '/characters/char_varia.png' WHERE id = 'magus-census-0016';
UPDATE characters SET visual_path = '/characters/char_murion.png' WHERE id = 'magus-census-0017';
UPDATE characters SET visual_path = '/characters/char_philippus_niger.png' WHERE id = 'magus-census-0018';
UPDATE characters SET visual_path = '/characters/char_ochren.png' WHERE id = 'magus-census-0019';
UPDATE characters SET visual_path = '/characters/char_vinaria.png' WHERE id = 'magus-census-0020';
UPDATE characters SET visual_path = '/characters/char_falke.png' WHERE id = 'magus-census-0021';
UPDATE characters SET visual_path = '/characters/char_handen.png' WHERE id = 'magus-census-0022';
UPDATE characters SET visual_path = '/characters/char_horst.png' WHERE id = 'magus-census-0023';
UPDATE characters SET visual_path = '/characters/char_eule.png' WHERE id = 'magus-census-0024';
UPDATE characters SET visual_path = '/characters/char_prospero.png' WHERE id = 'magus-census-0025';
UPDATE characters SET visual_path = '/characters/char_iasper.png' WHERE id = 'magus-census-0026';
UPDATE characters SET visual_path = '/characters/char_tasgillia.png' WHERE id = 'magus-census-0027';
UPDATE characters SET visual_path = '/characters/char_buliste.png' WHERE id = 'magus-census-0028';
UPDATE characters SET visual_path = '/characters/char_poenitus.png' WHERE id = 'magus-census-0029';
UPDATE characters SET visual_path = '/characters/char_txeru.png' WHERE id = 'magus-census-0030';
UPDATE characters SET visual_path = '/characters/char_cercistus.png' WHERE id = 'magus-census-0031';
UPDATE characters SET visual_path = '/characters/char_berengarius.png' WHERE id = 'magus-census-0032';
UPDATE characters SET visual_path = '/characters/char_garsias.png' WHERE id = 'magus-census-0033';
UPDATE characters SET visual_path = '/characters/char_christophoros.png' WHERE id = 'magus-census-0034';
UPDATE characters SET visual_path = '/characters/char_katarina.png' WHERE id = 'magus-census-0035';
UPDATE characters SET visual_path = '/characters/char_kalatos.png' WHERE id = 'magus-census-0036';
