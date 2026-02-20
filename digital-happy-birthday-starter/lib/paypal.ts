// ---------------------------------------------------------------------------
// PayPal API Helpers
// ---------------------------------------------------------------------------
// Uses PayPal Orders API v2 for order creation and capture.
// Uses /v1/notifications/verify-webhook-signature for webhook verification.
//
// 🔄 TO SWITCH TO LIVE:
//   Change PAYPAL_API_BASE from sandbox URL to 'https://api-m.paypal.com'
//   Use live credentials in .env
// ---------------------------------------------------------------------------

const PAYPAL_API_BASE =
    process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

// ---------------------------------------------------------------------------
// Get OAuth2 Access Token
// ---------------------------------------------------------------------------
export async function getPayPalAccessToken(): Promise<string> {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error(
            'Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET environment variables'
        );
    }

    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal OAuth failed: ${res.status} ${text}`);
    }

    const data = await res.json();
    return data.access_token;
}

// ---------------------------------------------------------------------------
// Create PayPal Order — INR 19.00
// ---------------------------------------------------------------------------
export interface CreateOrderResult {
    id: string;
    status: string;
    links: Array<{ href: string; rel: string; method: string }>;
}

export async function createPayPalOrder(
    description: string = 'Digital Happy Birthday Card'
): Promise<CreateOrderResult> {
    const accessToken = await getPayPalAccessToken();

    const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
            {
                amount: {
                    currency_code: 'INR',
                    value: '19.00',
                },
                description,
            },
        ],
        application_context: {
            brand_name: 'Happy Birthday Cards',
            landing_page: 'NO_PREFERENCE',
            user_action: 'PAY_NOW',
            return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/create?status=success`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/create?status=cancel`,
        },
    };

    const res = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal create order failed: ${res.status} ${text}`);
    }

    return res.json();
}

// ---------------------------------------------------------------------------
// Capture PayPal Order
// ---------------------------------------------------------------------------
export async function capturePayPalOrder(orderId: string) {
    const accessToken = await getPayPalAccessToken();

    const res = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal capture order failed: ${res.status} ${text}`);
    }

    return res.json();
}

// ---------------------------------------------------------------------------
// Verify Webhook Signature
// ---------------------------------------------------------------------------
export interface WebhookVerificationResult {
    verification_status: 'SUCCESS' | 'FAILURE';
}

export async function verifyWebhookSignature(
    headers: Record<string, string>,
    body: string
): Promise<WebhookVerificationResult> {
    const accessToken = await getPayPalAccessToken();
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;

    if (!webhookId) {
        throw new Error('Missing PAYPAL_WEBHOOK_ID environment variable');
    }

    const verificationPayload = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
    };

    const res = await fetch(
        `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(verificationPayload),
        }
    );

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`PayPal webhook verification failed: ${res.status} ${text}`);
    }

    return res.json();
}
