-- First migration: early access table
CREATE TABLE IF NOT EXISTS early_access (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  user_type TEXT NOT NULL, -- buyer | seller | both
  created_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_early_access_user_type ON early_access(user_type);
