'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

// ---------------------------------------------------------------------------
// PayPalButton — Checkout component
// ---------------------------------------------------------------------------
// Wraps @paypal/react-paypal-js to handle the client-side checkout flow.
// Server-side order creation and capture happen through our API routes.
// ---------------------------------------------------------------------------

interface PayPalButtonProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cardPayload: any;
    onSuccess: (slug: string) => void;
    onError: (error: string) => void;
    disabled?: boolean;
}

export default function PayPalButton({
    cardPayload,
    onSuccess,
    onError,
    disabled = false,
}: PayPalButtonProps) {
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    if (!clientId) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                <strong>PayPal not configured.</strong> Set{' '}
                <code>NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> in your .env file.
            </div>
        );
    }

    return (
        <PayPalScriptProvider
            options={{
                clientId,
                currency: 'INR',
                intent: 'capture',
            }}
        >
            <div className={disabled ? 'opacity-50 pointer-events-none' : ''}>
                <PayPalButtons
                    style={{
                        layout: 'vertical',
                        shape: 'pill',
                        label: 'pay',
                        height: 48,
                    }}
                    createOrder={async () => {
                        try {
                            const res = await fetch('/api/create-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(cardPayload),
                            });

                            if (!res.ok) {
                                const data = await res.json();
                                throw new Error(data.error || 'Failed to create order');
                            }

                            const data = await res.json();
                            return data.orderId;
                        } catch (err) {
                            onError(
                                err instanceof Error ? err.message : 'Failed to create order'
                            );
                            throw err;
                        }
                    }}
                    onApprove={async (data) => {
                        try {
                            const res = await fetch('/api/capture-order', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ orderId: data.orderID }),
                            });

                            if (!res.ok) {
                                const errData = await res.json();
                                throw new Error(errData.error || 'Failed to capture payment');
                            }

                            const result = await res.json();
                            onSuccess(result.slug);
                        } catch (err) {
                            onError(
                                err instanceof Error
                                    ? err.message
                                    : 'Payment failed. Please try again.'
                            );
                        }
                    }}
                    onError={(err) => {
                        console.error('PayPal error:', err);
                        onError('Payment was not completed. Please try again.');
                    }}
                    onCancel={() => {
                        onError('Payment was cancelled.');
                    }}
                />
            </div>
        </PayPalScriptProvider>
    );
}
