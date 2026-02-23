import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Supabase Database Layer
// ---------------------------------------------------------------------------
// Drop-in async replacement for the SQLite db.ts.
// Uses the same interfaces and function names, but all functions are async.
//
// Requires: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in env.
// ---------------------------------------------------------------------------

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
    if (!_supabase) {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!url || !key) {
            throw new Error(
                'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for Supabase mode.'
            );
        }
        _supabase = createClient(url, key);
    }
    return _supabase;
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

export async function createCard(cardJson: string, templateId: string): Promise<number> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('cards')
        .insert({ card_json: cardJson, template_id: templateId })
        .select('id')
        .single();
    if (error) throw new Error(`createCard: ${error.message}`);
    return data.id;
}

export async function getCardBySlug(slug: string): Promise<CardRow | undefined> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('cards')
        .select('*')
        .eq('slug', slug)
        .neq('status', 'deleted')
        .single();
    if (error && error.code !== 'PGRST116') throw new Error(`getCardBySlug: ${error.message}`);
    return data ?? undefined;
}

export async function getCardById(id: number): Promise<CardRow | undefined> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('cards')
        .select('*')
        .eq('id', id)
        .single();
    if (error && error.code !== 'PGRST116') throw new Error(`getCardById: ${error.message}`);
    return data ?? undefined;
}

export async function assignSlug(cardId: number, slug: string): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb
        .from('cards')
        .update({ slug, status: 'active', updated_at: new Date().toISOString() })
        .eq('id', cardId);
    if (error) throw new Error(`assignSlug: ${error.message}`);
}

export async function createCardWithSlug(
    cardJson: string,
    templateId: string,
    slug: string
): Promise<number> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('cards')
        .insert({ card_json: cardJson, template_id: templateId, slug, status: 'active' })
        .select('id')
        .single();
    if (error) throw new Error(`createCardWithSlug: ${error.message}`);
    return data.id;
}

export async function slugExists(slug: string): Promise<boolean> {
    const sb = getSupabase();
    const { data } = await sb
        .from('cards')
        .select('id')
        .eq('slug', slug)
        .limit(1);
    return (data?.length ?? 0) > 0;
}

export async function listCards(limit = 50, offset = 0): Promise<CardRow[]> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('cards')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    if (error) throw new Error(`listCards: ${error.message}`);
    return data ?? [];
}

export async function flagCard(id: number): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb
        .from('cards')
        .update({ status: 'flagged', updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) throw new Error(`flagCard: ${error.message}`);
}

export async function deleteCard(id: number): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb
        .from('cards')
        .update({ status: 'deleted', updated_at: new Date().toISOString() })
        .eq('id', id);
    if (error) throw new Error(`deleteCard: ${error.message}`);
}

export async function hardDeleteCard(id: number): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb.from('cards').delete().eq('id', id);
    if (error) throw new Error(`hardDeleteCard: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Payment Helpers (Legacy — PayPal)
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

export async function createPayment(cardId: number, paypalOrderId: string): Promise<number> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('payments')
        .insert({ card_id: cardId, paypal_order_id: paypalOrderId })
        .select('id')
        .single();
    if (error) throw new Error(`createPayment: ${error.message}`);
    return data.id;
}

export async function getPaymentByOrderId(orderId: string): Promise<PaymentRow | undefined> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('payments')
        .select('*')
        .eq('paypal_order_id', orderId)
        .single();
    if (error && error.code !== 'PGRST116') throw new Error(`getPaymentByOrderId: ${error.message}`);
    return data ?? undefined;
}

export async function markPaymentCompleted(
    orderId: string,
    payerEmail?: string,
    rawResponse?: string
): Promise<void> {
    const sb = getSupabase();
    const { error } = await sb
        .from('payments')
        .update({
            status: 'completed',
            payer_email: payerEmail || null,
            raw_response: rawResponse || null,
            updated_at: new Date().toISOString(),
        })
        .eq('paypal_order_id', orderId);
    if (error) throw new Error(`markPaymentCompleted: ${error.message}`);
}

export async function getPaymentAuditLog(limit = 100): Promise<PaymentRow[]> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) throw new Error(`getPaymentAuditLog: ${error.message}`);
    return data ?? [];
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

export async function addReply(cardId: number, message: string, sender?: string): Promise<number> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('replies')
        .insert({ card_id: cardId, message, sender: sender || 'Anonymous' })
        .select('id')
        .single();
    if (error) throw new Error(`addReply: ${error.message}`);
    return data.id;
}

export async function getRepliesByCardId(cardId: number): Promise<ReplyRow[]> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('replies')
        .select('*')
        .eq('card_id', cardId)
        .order('created_at', { ascending: true });
    if (error) throw new Error(`getRepliesByCardId: ${error.message}`);
    return data ?? [];
}

// ---------------------------------------------------------------------------
// Donation Click Analytics
// ---------------------------------------------------------------------------
export interface DonationClickRow {
    id: number;
    card_slug: string;
    provider: string;
    currency: string;
    amount: string;
    ip_hash: string | null;
    user_agent: string | null;
    created_at: string;
}

export async function trackDonationClick(
    slug: string,
    provider: string,
    currency: string,
    amount: string,
    ipHash?: string,
    userAgent?: string
): Promise<number> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('donation_clicks')
        .insert({
            card_slug: slug,
            provider,
            currency,
            amount,
            ip_hash: ipHash || null,
            user_agent: userAgent || null,
        })
        .select('id')
        .single();
    if (error) throw new Error(`trackDonationClick: ${error.message}`);
    return data.id;
}

export interface DonationAnalytics {
    provider: string;
    currency: string;
    amount: string;
    click_count: number;
}

export async function getDonationAnalytics(): Promise<DonationAnalytics[]> {
    // Supabase doesn't support GROUP BY natively in the JS client.
    // Use an RPC call or raw query. Here we use a workaround:
    // fetch all clicks and aggregate in JS, OR use a database function.
    //
    // For simplicity, we fetch recent clicks and aggregate in JS.
    const sb = getSupabase();
    const { data, error } = await sb
        .from('donation_clicks')
        .select('provider, currency, amount');
    if (error) throw new Error(`getDonationAnalytics: ${error.message}`);

    const map = new Map<string, DonationAnalytics>();
    for (const row of data ?? []) {
        const key = `${row.provider}:${row.currency}:${row.amount}`;
        const existing = map.get(key);
        if (existing) {
            existing.click_count++;
        } else {
            map.set(key, {
                provider: row.provider,
                currency: row.currency,
                amount: row.amount,
                click_count: 1,
            });
        }
    }
    return Array.from(map.values()).sort((a, b) => b.click_count - a.click_count);
}

export async function getDonationClicksBySlug(slug: string): Promise<DonationClickRow[]> {
    const sb = getSupabase();
    const { data, error } = await sb
        .from('donation_clicks')
        .select('*')
        .eq('card_slug', slug)
        .order('created_at', { ascending: false });
    if (error) throw new Error(`getDonationClicksBySlug: ${error.message}`);
    return data ?? [];
}

// ---------------------------------------------------------------------------
// Data Expiry — Purge rows older than 7 days
// ---------------------------------------------------------------------------

export interface PurgeResult {
    cards_deleted: number;
    replies_deleted: number;
    payments_deleted: number;
    donation_clicks_deleted: number;
}

export async function purgeExpiredData(): Promise<PurgeResult> {
    const sb = getSupabase();
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Delete in dependency order: children first, then parent

    // 1. Donation clicks (no FK dependency)
    const { data: dcData, error: dcErr } = await sb
        .from('donation_clicks')
        .delete()
        .lt('created_at', cutoff)
        .select('id');
    if (dcErr) throw new Error(`purgeExpiredData (donation_clicks): ${dcErr.message}`);

    // 2. Replies (FK → cards)
    const { data: rData, error: rErr } = await sb
        .from('replies')
        .delete()
        .lt('created_at', cutoff)
        .select('id');
    if (rErr) throw new Error(`purgeExpiredData (replies): ${rErr.message}`);

    // 3. Payments (FK → cards)
    const { data: pData, error: pErr } = await sb
        .from('payments')
        .delete()
        .lt('created_at', cutoff)
        .select('id');
    if (pErr) throw new Error(`purgeExpiredData (payments): ${pErr.message}`);

    // 4. Cards (parent table — last)
    const { data: cData, error: cErr } = await sb
        .from('cards')
        .delete()
        .lt('created_at', cutoff)
        .select('id');
    if (cErr) throw new Error(`purgeExpiredData (cards): ${cErr.message}`);

    return {
        cards_deleted: cData?.length ?? 0,
        replies_deleted: rData?.length ?? 0,
        payments_deleted: pData?.length ?? 0,
        donation_clicks_deleted: dcData?.length ?? 0,
    };
}

