-- Staging table for candidate facilities discovered by automated feeds
-- (SEC EDGAR filings, news RSS). Nothing here is promoted to data_centers
-- automatically — leads sit here for manual review.
CREATE TABLE IF NOT EXISTS facility_leads (
  id TEXT PRIMARY KEY,              -- `${source}:${external_ref}`
  source TEXT NOT NULL,             -- 'sec-edgar' | 'news-rss'
  external_ref TEXT NOT NULL,       -- accession number / article URL
  title TEXT NOT NULL,
  company TEXT,
  snippet TEXT NOT NULL,
  url TEXT NOT NULL,
  discovered_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'  -- 'new' | 'reviewed' | 'promoted' | 'dismissed'
);

CREATE INDEX IF NOT EXISTS idx_facility_leads_status
  ON facility_leads(status, discovered_at DESC);

CREATE INDEX IF NOT EXISTS idx_facility_leads_source
  ON facility_leads(source, discovered_at DESC);
