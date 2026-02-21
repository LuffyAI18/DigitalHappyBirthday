// ---------------------------------------------------------------------------
// Database Layer — Auto-selecting Proxy
// ---------------------------------------------------------------------------
// Detects environment and exports the correct database implementation:
//
// • If SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set → Supabase (async, PostgreSQL)
// • Otherwise → SQLite (sync, better-sqlite3) for local development
//
// ALL exported functions are ASYNC (return Promises) regardless of backend.
// Callers must always `await` database calls.
// ---------------------------------------------------------------------------

import type { CardRow, PaymentRow, ReplyRow, DonationClickRow, DonationAnalytics } from './db-supabase';

// Re-export types so callers only import from '@/lib/db'
export type { CardRow, PaymentRow, ReplyRow, DonationClickRow, DonationAnalytics };

const USE_SUPABASE = !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

// Are we running on Vercel? (Vercel sets this automatically)
const IS_VERCEL = !!process.env.VERCEL;

// ---------------------------------------------------------------------------
// Dynamic imports — load the correct module lazily
// ---------------------------------------------------------------------------

async function getSqlite() {
  if (IS_VERCEL) {
    throw new Error(
      'SQLite (better-sqlite3) cannot run on Vercel. ' +
      'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables ' +
      'in your Vercel project settings to use Supabase instead.'
    );
  }
  return import('./db-sqlite');
}

async function getSupabaseDb() {
  return import('./db-supabase');
}

// ---------------------------------------------------------------------------
// Card Helpers
// ---------------------------------------------------------------------------

export async function createCard(cardJson: string, templateId: string): Promise<number> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.createCard(cardJson, templateId);
  }
  const m = await getSqlite();
  return m.createCard(cardJson, templateId);
}

export async function getCardBySlug(slug: string): Promise<CardRow | undefined> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.getCardBySlug(slug);
  }
  const m = await getSqlite();
  return m.getCardBySlug(slug);
}

export async function getCardById(id: number): Promise<CardRow | undefined> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.getCardById(id);
  }
  const m = await getSqlite();
  return m.getCardById(id);
}

export async function assignSlug(cardId: number, slug: string): Promise<void> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.assignSlug(cardId, slug);
  }
  const m = await getSqlite();
  m.assignSlug(cardId, slug);
}

export async function createCardWithSlug(
  cardJson: string,
  templateId: string,
  slug: string
): Promise<number> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.createCardWithSlug(cardJson, templateId, slug);
  }
  const m = await getSqlite();
  return m.createCardWithSlug(cardJson, templateId, slug);
}

export async function slugExists(slug: string): Promise<boolean> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.slugExists(slug);
  }
  const m = await getSqlite();
  return m.slugExists(slug);
}

export async function listCards(limit = 50, offset = 0): Promise<CardRow[]> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.listCards(limit, offset);
  }
  const m = await getSqlite();
  return m.listCards(limit, offset);
}

export async function flagCard(id: number): Promise<void> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.flagCard(id);
  }
  const m = await getSqlite();
  m.flagCard(id);
}

export async function deleteCard(id: number): Promise<void> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.deleteCard(id);
  }
  const m = await getSqlite();
  m.deleteCard(id);
}

export async function hardDeleteCard(id: number): Promise<void> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.hardDeleteCard(id);
  }
  const m = await getSqlite();
  m.hardDeleteCard(id);
}

// ---------------------------------------------------------------------------
// Payment Helpers (Legacy — PayPal)
// ---------------------------------------------------------------------------

export async function createPayment(cardId: number, paypalOrderId: string): Promise<number> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.createPayment(cardId, paypalOrderId);
  }
  const m = await getSqlite();
  return m.createPayment(cardId, paypalOrderId);
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentRow | undefined> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.getPaymentByOrderId(orderId);
  }
  const m = await getSqlite();
  return m.getPaymentByOrderId(orderId);
}

export async function markPaymentCompleted(
  orderId: string,
  payerEmail?: string,
  rawResponse?: string
): Promise<void> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.markPaymentCompleted(orderId, payerEmail, rawResponse);
  }
  const m = await getSqlite();
  m.markPaymentCompleted(orderId, payerEmail, rawResponse);
}

export async function getPaymentAuditLog(limit = 100): Promise<PaymentRow[]> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.getPaymentAuditLog(limit);
  }
  const m = await getSqlite();
  return m.getPaymentAuditLog(limit);
}

// ---------------------------------------------------------------------------
// Reply Helpers
// ---------------------------------------------------------------------------

export async function addReply(cardId: number, message: string, sender?: string): Promise<number> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.addReply(cardId, message, sender);
  }
  const m = await getSqlite();
  return m.addReply(cardId, message, sender);
}

export async function getRepliesByCardId(cardId: number): Promise<ReplyRow[]> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.getRepliesByCardId(cardId);
  }
  const m = await getSqlite();
  return m.getRepliesByCardId(cardId);
}

// ---------------------------------------------------------------------------
// Donation Click Analytics
// ---------------------------------------------------------------------------

export async function trackDonationClick(
  slug: string,
  provider: string,
  currency: string,
  amount: string,
  ipHash?: string,
  userAgent?: string
): Promise<number> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.trackDonationClick(slug, provider, currency, amount, ipHash, userAgent);
  }
  const m = await getSqlite();
  return m.trackDonationClick(slug, provider, currency, amount, ipHash, userAgent);
}

export async function getDonationAnalytics(): Promise<DonationAnalytics[]> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.getDonationAnalytics();
  }
  const m = await getSqlite();
  return m.getDonationAnalytics();
}

export async function getDonationClicksBySlug(slug: string): Promise<DonationClickRow[]> {
  if (USE_SUPABASE) {
    const m = await getSupabaseDb();
    return m.getDonationClicksBySlug(slug);
  }
  const m = await getSqlite();
  return m.getDonationClicksBySlug(slug);
}
