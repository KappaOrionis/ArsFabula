-- 20260515000008_expand_covenant_model.sql
ALTER TABLE covenants ADD COLUMN season_status TEXT;
ALTER TABLE covenants ADD COLUMN location_desc TEXT;
ALTER TABLE covenants ADD COLUMN gps_coords TEXT;
ALTER TABLE covenants ADD COLUMN notable_magi TEXT;
ALTER TABLE covenants ADD COLUMN custodes TEXT;
ALTER TABLE covenants ADD COLUMN grogs_desc TEXT;
ALTER TABLE covenants ADD COLUMN vis_sources TEXT;
ALTER TABLE covenants ADD COLUMN laboratories TEXT;
ALTER TABLE covenants ADD COLUMN library TEXT;
