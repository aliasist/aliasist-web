-- Track which external source contributed each facility, and its id in that source.
-- Nullable so existing rows / code paths are unaffected.
ALTER TABLE data_centers ADD COLUMN source TEXT;
ALTER TABLE data_centers ADD COLUMN external_ref TEXT;

CREATE INDEX IF NOT EXISTS idx_data_centers_source ON data_centers(source);
CREATE INDEX IF NOT EXISTS idx_data_centers_external_ref ON data_centers(external_ref);
