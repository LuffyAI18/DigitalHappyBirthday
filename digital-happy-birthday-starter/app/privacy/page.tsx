import Link from 'next/link';

// ---------------------------------------------------------------------------
// Privacy Policy Page — /privacy
// ---------------------------------------------------------------------------

export const metadata = {
    title: 'Privacy Policy — Digital Happy Birthday',
    description: 'How we handle your data when creating birthday cards.',
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full glass rounded-3xl p-8 space-y-6">
                <h1 className="text-3xl font-serif font-bold text-center">
                    🔒 Privacy Policy
                </h1>

                <div className="space-y-4 text-gray-700 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-semibold mb-2">Data Retention</h2>
                        <p>
                            <strong>Cards are automatically deleted 7 days after creation.</strong>{' '}
                            This includes all associated data such as card content, sender and
                            recipient names, and any customization options. Once deleted, this data
                            cannot be recovered.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">Payment & Donations</h2>
                        <p>
                            <strong>No payment data is stored</strong> — donations are processed
                            entirely by the chosen provider (e.g., Buy Me a Coffee). We only track
                            anonymized click analytics (provider, currency, amount) to understand
                            donation patterns. IP addresses are hashed and truncated.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">What We Collect</h2>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Card content (to, from, message) — deleted after 7 days</li>
                            <li>Template and customization choices — deleted with card</li>
                            <li>Anonymized IP hash (16 chars) for rate limiting — deleted after 7 days</li>
                            <li>Browser User-Agent for donation analytics — deleted after 7 days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">What We Don&apos;t Collect</h2>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Email addresses (unless voluntarily given via donation)</li>
                            <li>Account registrations or passwords</li>
                            <li>Cookies for tracking or advertising</li>
                            <li>Credit card, PayPal, or Stripe details</li>
                            <li>Geolocation (optional, only for currency detection)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">GDPR & Data Removal</h2>
                        <p>
                            All data is automatically purged within 7 days. If you need immediate
                            removal, contact the admin. Hard-delete functionality is available
                            through the admin dashboard for GDPR compliance.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">Open Source</h2>
                        <p>
                            This project is fully open source under the MIT License. You can
                            inspect exactly what data is collected by reviewing the source code.
                        </p>
                    </section>
                </div>

                <div className="text-center pt-4">
                    <Link
                        href="/"
                        className="px-6 py-2.5 rounded-full text-sm font-medium bg-pastel-400 text-white hover:bg-pastel-500 transition-all inline-block"
                    >
                        ← Back to Home
                    </Link>
                </div>

                <p className="text-center text-xs text-gray-400">
                    Last updated: February 2026
                </p>
            </div>
        </div>
    );
}
