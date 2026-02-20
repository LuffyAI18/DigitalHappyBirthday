import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ---------------------------------------------------------------------------
// Database Connection
// ---------------------------------------------------------------------------
// Uses SQLite via better-sqlite3 for zero-setup local dev.
//
// 🔄 PRODUCTION SWITCH — Supabase
// Replace this file with a Supabase client. Example:
//   import { createClient } from '@supabase/supabase-js';
//   const supabase = createClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_SERVICE_ROLE_KEY!
//   );
// Then rewrite each helper below to call supabase.from('cards')... etc.
// ---------------------------------------------------------------------------

const DB_PATH = process.env.DATABASE_URL || './data/birthday-cards.db';

function getDbPath(): string {
  const resolved = path.resolve(process.cwd(), DB_PATH);
  const dir = path.dirname(resolved);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return resolved;
}

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(getDbPath());
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS cards (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT UNIQUE,
      card_json   TEXT NOT NULL,
      template_id TEXT NOT NULL DEFAULT 'pastel-heart',
      status      TEXT NOT NULL DEFAULT 'pending',   -- pending | paid | flagged | deleted
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS payments (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id         INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      paypal_order_id TEXT UNIQUE NOT NULL,
      status          TEXT NOT NULL DEFAULT 'created', -- created | approved | completed | failed
      amount          TEXT NOT NULL DEFAULT '19.00',
      currency        TEXT NOT NULL DEFAULT 'INR',
      payer_email     TEXT,
      raw_response    TEXT,
      created_at      TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at      TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS replies (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id    INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
      message    TEXT NOT NULL,
      sender     TEXT DEFAULT 'Anonymous',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
    CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(paypal_order_id);
  `);
}

// ---------------------------------------------------------------------------
// Card Helpers
// ---------------------------------------------------------------------------
export interface CardRow {
  id: number;
  slug: string | null;
  card_json: string;
  template_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function createCard(cardJson: string, templateId: string): number {
  const db = getDb();
  const result = db
    .prepare('INSERT INTO cards (card_json, template_id) VALUES (?, ?)')
    .run(cardJson, templateId);
  return result.lastInsertRowid as number;
}

export function getCardBySlug(slug: string): CardRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM cards WHERE slug = ? AND status != ?').get(slug, 'deleted') as
    | CardRow
    | undefined;
}

export function getCardById(id: number): CardRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM cards WHERE id = ?').get(id) as CardRow | undefined;
}

export function assignSlug(cardId: number, slug: string) {
  const db = getDb();
  db.prepare("UPDATE cards SET slug = ?, status = 'paid', updated_at = datetime('now') WHERE id = ?").run(
    slug,
    cardId
  );
}

export function slugExists(slug: string): boolean {
  const db = getDb();
  const row = db.prepare('SELECT 1 FROM cards WHERE slug = ?').get(slug);
  return !!row;
}

export function listCards(limit = 50, offset = 0): CardRow[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM cards ORDER BY created_at DESC LIMIT ? OFFSET ?')
    .all(limit, offset) as CardRow[];
}

export function flagCard(id: number) {
  const db = getDb();
  db.prepare("UPDATE cards SET status = 'flagged', updated_at = datetime('now') WHERE id = ?").run(id);
}

export function deleteCard(id: number) {
  const db = getDb();
  db.prepare("UPDATE cards SET status = 'deleted', updated_at = datetime('now') WHERE id = ?").run(id);
}

export function hardDeleteCard(id: number) {
  const db = getDb();
  db.prepare('DELETE FROM cards WHERE id = ?').run(id);
}

// ---------------------------------------------------------------------------
// Payment Helpers
// ---------------------------------------------------------------------------
export interface PaymentRow {
  id: number;
  card_id: number;
  paypal_order_id: string;
  status: string;
  amount: string;
  currency: string;
  payer_email: string | null;
  raw_response: string | null;
  created_at: string;
  updated_at: string;
}

export function createPayment(cardId: number, paypalOrderId: string): number {
  const db = getDb();
  const result = db
    .prepare('INSERT INTO payments (card_id, paypal_order_id) VALUES (?, ?)')
    .run(cardId, paypalOrderId);
  return result.lastInsertRowid as number;
}

export function getPaymentByOrderId(orderId: string): PaymentRow | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM payments WHERE paypal_order_id = ?').get(orderId) as
    | PaymentRow
    | undefined;
}

export function markPaymentCompleted(
  orderId: string,
  payerEmail?: string,
  rawResponse?: string
) {
  const db = getDb();
  db.prepare(
    "UPDATE payments SET status = 'completed', payer_email = ?, raw_response = ?, updated_at = datetime('now') WHERE paypal_order_id = ?"
  ).run(payerEmail || null, rawResponse || null, orderId);
}

export function getPaymentAuditLog(limit = 100): PaymentRow[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM payments ORDER BY created_at DESC LIMIT ?')
    .all(limit) as PaymentRow[];
}

// ---------------------------------------------------------------------------
// Reply Helpers
// ---------------------------------------------------------------------------
export interface ReplyRow {
  id: number;
  card_id: number;
  message: string;
  sender: string;
  created_at: string;
}

export function addReply(cardId: number, message: string, sender?: string): number {
  const db = getDb();
  const result = db
    .prepare('INSERT INTO replies (card_id, message, sender) VALUES (?, ?, ?)')
    .run(cardId, message, sender || 'Anonymous');
  return result.lastInsertRowid as number;
}

export function getRepliesByCardId(cardId: number): ReplyRow[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM replies WHERE card_id = ? ORDER BY created_at ASC')
    .all(cardId) as ReplyRow[];
}
