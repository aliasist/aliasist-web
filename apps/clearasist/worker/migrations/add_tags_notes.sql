-- Migration: Add tags and notes for better data curation
-- Run with: npx wrangler d1 execute clearasist-meta --file=./migrations/add_tags_notes.sql --remote

ALTER TABLE metadata_reports ADD COLUMN tags TEXT DEFAULT '[]';
ALTER TABLE metadata_reports ADD COLUMN notes TEXT DEFAULT '';