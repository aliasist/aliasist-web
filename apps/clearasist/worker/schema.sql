-- D1 schema for storing stripped metadata reports
-- Run once on a new database with: npx wrangler d1 execute clearasist-meta --file=./schema.sql

CREATE TABLE IF NOT EXISTS metadata_reports (
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
  tags TEXT DEFAULT '[]',                     -- JSON array for admin curation
  notes TEXT DEFAULT '',                      -- Admin curation notes
  user_agent TEXT,
  ip TEXT,                                    -- optional, can be stripped later
  partials TEXT                               -- JSON: {type: 'thumbnail', data: base64, width, height} or text excerpts
);

-- Useful indexes for querying later
CREATE INDEX IF NOT EXISTS idx_timestamp ON metadata_reports(timestamp);
CREATE INDEX IF NOT EXISTS idx_file_type ON metadata_reports(file_type);
CREATE INDEX IF NOT EXISTS idx_removed_count ON metadata_reports(removed_count);
