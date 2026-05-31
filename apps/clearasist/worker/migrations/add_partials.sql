-- Migration: Add lightweight thumbnail or text excerpt storage.
-- Run with: npx wrangler d1 execute clearasist-meta --file=./migrations/add_partials.sql --remote

ALTER TABLE metadata_reports ADD COLUMN partials TEXT;
