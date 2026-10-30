CREATE TABLE IF NOT EXISTS profiles (
  username    TEXT PRIMARY KEY,
  settings    TEXT NOT NULL DEFAULT '{}',
  created_at  INTEGER NOT NULL,
  last_seen   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS files (
  username    TEXT NOT NULL,
  name        TEXT NOT NULL,
  content     TEXT NOT NULL DEFAULT '',
  updated_at  INTEGER NOT NULL,
  PRIMARY KEY (username, name),
  FOREIGN KEY (username) REFERENCES profiles(username)
);
