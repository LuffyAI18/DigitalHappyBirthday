'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ---------------------------------------------------------------------------
// Admin Dashboard — /admin
// ---------------------------------------------------------------------------
// Protected by ADMIN_TOKEN via middleware and API verification.
// Allows viewing, flagging, and deleting cards + payment audit.
// ---------------------------------------------------------------------------

interface CardData {
    id: number;
    slug: string | null;
    card_json: {
        to: string;
        message: string;
        from: string;
        templateId: string;
        flagged?: boolean;
        flaggedWords?: string[];
    };
    template_id: string;
    status: string;
    created_at: string;
}

interface PaymentData {
    id: number;
    card_id: number;
    paypal_order_id: string;
    status: string;
    amount: string;
    currency: string;
    payer_email: string | null;
    created_at: string;
}

export default function AdminPage() {
    const [token, setToken] = useState('');
    const [authenticated, setAuthenticated] = useState(false);
    const [cards, setCards] = useState<CardData[]>([]);
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'cards' | 'payments'>('cards');

    const fetchData = async (adminToken: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/cards?token=${adminToken}`);
            if (!res.ok) throw new Error('Unauthorized');
            const data = await res.json();
            setCards(data.cards);
            setPayments(data.payments);
            setAuthenticated(true);
        } catch {
            alert('Invalid admin token');
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData(token);
    };

    const handleFlag = async (id: number) => {
        await fetch(`/api/admin/card/${id}?token=${token}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'flag' }),
        });
        fetchData(token);
    };

    const handleDelete = async (id: number, hard = false) => {
        const confirmed = confirm(
            hard
                ? 'PERMANENTLY delete this card? This cannot be undone (GDPR).'
                : 'Soft-delete this card?'
        );
        if (!confirmed) return;

        await fetch(
            `/api/admin/card/${id}?token=${token}${hard ? '&hard=true' : ''}`,
            { method: 'DELETE' }
        );
        fetchData(token);
    };

    // Login screen
    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.form
                    onSubmit={handleLogin}
                    className="glass rounded-2xl p-8 max-w-sm w-full space-y-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-2xl font-bold text-center font-serif">
                        🔐 Admin Access
                    </h1>
                    <input
                        type="password"
                        placeholder="Enter admin token"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-pastel-300 outline-none"
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-pastel-400 text-white rounded-xl font-medium hover:bg-pastel-500 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Access Dashboard'}
                    </button>
                    <Link
                        href="/"
                        className="block text-center text-sm text-gray-400 hover:text-gray-600"
                    >
                        ← Back to home
                    </Link>
                </motion.form>
            </div>
        );
    }

    // Dashboard
    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pt-4">
                    <h1 className="text-2xl font-bold font-serif">🔧 Admin Dashboard</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => fetchData(token)}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-all"
                        >
                            🔄 Refresh
                        </button>
                        <Link
                            href="/"
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-all"
                        >
                            ← Home
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('cards')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'cards'
                                ? 'bg-pastel-400 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        📋 Cards ({cards.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('payments')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'payments'
                                ? 'bg-pastel-400 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                    >
                        💳 Payments ({payments.length})
                    </button>
                </div>

                {/* Cards Table */}
                {activeTab === 'cards' && (
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 text-left">
                                        <th className="px-4 py-3 font-semibold">ID</th>
                                        <th className="px-4 py-3 font-semibold">To / From</th>
                                        <th className="px-4 py-3 font-semibold">Template</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Slug</th>
                                        <th className="px-4 py-3 font-semibold">Created</th>
                                        <th className="px-4 py-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {cards.map((card) => (
                                        <tr
                                            key={card.id}
                                            className={`hover:bg-gray-50/50 ${card.card_json.flagged ? 'bg-red-50/50' : ''
                                                }`}
                                        >
                                            <td className="px-4 py-3">{card.id}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{card.card_json.to}</div>
                                                <div className="text-gray-400">from {card.card_json.from}</div>
                                                {card.card_json.flagged && (
                                                    <span className="text-xs text-red-500">
                                                        ⚠️ {card.card_json.flaggedWords?.join(', ')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{card.template_id}</td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${card.status === 'paid'
                                                            ? 'bg-green-100 text-green-700'
                                                            : card.status === 'flagged'
                                                                ? 'bg-red-100 text-red-700'
                                                                : card.status === 'deleted'
                                                                    ? 'bg-gray-100 text-gray-500'
                                                                    : 'bg-amber-100 text-amber-700'
                                                        }`}
                                                >
                                                    {card.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {card.slug ? (
                                                    <Link
                                                        href={`/card/${card.slug}`}
                                                        className="text-pastel-400 hover:underline font-mono text-xs"
                                                    >
                                                        {card.slug}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-300">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">
                                                {new Date(card.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleFlag(card.id)}
                                                        className="px-2 py-1 text-xs bg-amber-100 hover:bg-amber-200 rounded transition-all"
                                                        title="Flag"
                                                    >
                                                        🚩
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(card.id)}
                                                        className="px-2 py-1 text-xs bg-red-100 hover:bg-red-200 rounded transition-all"
                                                        title="Soft Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(card.id, true)}
                                                        className="px-2 py-1 text-xs bg-red-200 hover:bg-red-300 rounded transition-all"
                                                        title="Hard Delete (GDPR)"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {cards.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                                No cards yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Payments Table */}
                {activeTab === 'payments' && (
                    <div className="glass rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/80 text-left">
                                        <th className="px-4 py-3 font-semibold">ID</th>
                                        <th className="px-4 py-3 font-semibold">Card ID</th>
                                        <th className="px-4 py-3 font-semibold">PayPal Order</th>
                                        <th className="px-4 py-3 font-semibold">Status</th>
                                        <th className="px-4 py-3 font-semibold">Amount</th>
                                        <th className="px-4 py-3 font-semibold">Payer</th>
                                        <th className="px-4 py-3 font-semibold">Created</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">{p.id}</td>
                                            <td className="px-4 py-3">{p.card_id}</td>
                                            <td className="px-4 py-3 font-mono text-xs">
                                                {p.paypal_order_id}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'completed'
                                                            ? 'bg-green-100 text-green-700'
                                                            : p.status === 'created'
                                                                ? 'bg-amber-100 text-amber-700'
                                                                : 'bg-gray-100 text-gray-500'
                                                        }`}
                                                >
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {p.currency} {p.amount}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">
                                                {p.payer_email || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">
                                                {new Date(p.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                                No payments yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
