CREATE TABLE IF NOT EXISTS external_api_observations (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  scope TEXT NOT NULL,
  facility_id INTEGER,
  payload_json TEXT NOT NULL,
  observed_at INTEGER NOT NULL,
  registered_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_external_api_observations_source
  ON external_api_observations(source, observed_at DESC);

CREATE INDEX IF NOT EXISTS idx_external_api_observations_facility
  ON external_api_observations(facility_id, observed_at DESC);
