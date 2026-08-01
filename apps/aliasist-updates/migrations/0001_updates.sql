CREATE TABLE updates (
  id TEXT PRIMARY KEY,
  kind TEXT NOT NULL DEFAULT 'update',
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_updates_date ON updates (date DESC);
