// ---------------------------------------------------------------------------
// Migration Script: Remove Replies Table
// ---------------------------------------------------------------------------
// Run this script to permanently drop the replies table.
// This is irreversible — all existing reply data will be lost.
//
// SQLite:   node -e "require('better-sqlite3')('./data/birthday-cards.db').exec('DROP TABLE IF EXISTS replies')"
// Supabase: Run the SQL below in the Supabase SQL editor.
// ---------------------------------------------------------------------------

/*
-- Supabase SQL Migration —————————————————————————————————

-- Step 1: Drop the replies table
DROP TABLE IF EXISTS replies;

-- Step 2: Add expires_at and is_deleted columns to cards (if not already present)
ALTER TABLE cards ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');
ALTER TABLE cards ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

-- Step 3: Create deletion_audit table
CREATE TABLE IF NOT EXISTS deletion_audit (
  id         SERIAL PRIMARY KEY,
  card_id    INTEGER NOT NULL,
  deleted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason     TEXT NOT NULL DEFAULT 'expired'
);

-- Step 4: Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_cards_expires ON cards(expires_at);
CREATE INDEX IF NOT EXISTS idx_cards_is_deleted ON cards(is_deleted);

-- Step 5: Set expires_at for existing cards (7 days from now or from their creation)
UPDATE cards SET expires_at = created_at + INTERVAL '7 days' WHERE expires_at IS NULL;

-- ——————————————————————————————————————————————————————————
*/

console.log(`
╔══════════════════════════════════════════════════════════╗
║  Reply Table Migration Script                            ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  This script is for reference only.                      ║
║  Run the SQL shown above in the Supabase SQL editor.     ║
║                                                          ║
║  For local SQLite, delete the birthday.db file and       ║
║  restart the app — the schema will be recreated          ║
║  automatically without the active reply functions.       ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
`);
