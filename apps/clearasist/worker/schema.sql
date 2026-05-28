-- D1 schema for storing stripped metadata reports
-- Run with: npx wrangler d1 execute clearasist-metadata --file=./worker/schema.sql

DROP TABLE IF EXISTS metadata_reports;

CREATE TABLE metadata_reports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,                    -- ISO string
  filename TEXT,
  file_type TEXT,                             -- 'image' | 'pdf' | 'office'
  extension TEXT,
  original_size INTEGER,
  cleaned_size INTEGER,
  removed_count INTEGER,
  removed_items TEXT,                         -- JSON array
  raw_metadata TEXT,                          -- JSON (before)
  cleaned_metadata TEXT,                      -- JSON (after)
  user_agent TEXT,
  ip TEXT                                     -- optional, can be stripped later
);

-- Useful indexes for querying later
CREATE INDEX idx_timestamp ON metadata_reports(timestamp);
CREATE INDEX idx_file_type ON metadata_reports(file_type);
CREATE INDEX idx_removed_count ON metadata_reports(removed_count);