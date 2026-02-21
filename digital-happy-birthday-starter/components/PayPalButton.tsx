// ---------------------------------------------------------------------------
// FEATURE_FLAG_PAYPAL — DISABLED
// ---------------------------------------------------------------------------
// This component was the PayPal checkout button used in the ₹19 payment flow.
// It has been replaced by free card creation with donation support via BMAC.
//
// To re-enable:
// 1. npm install @paypal/react-paypal-js
// 2. Set FEATURE_FLAG_PAYPAL=true and NEXT_PUBLIC_PAYPAL_CLIENT_ID in .env
// 3. Uncomment the component below
// ---------------------------------------------------------------------------

/*
'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { useState } from 'react';

interface PayPalButtonProps {
    cardData: Record<string, unknown>;
    onSuccess: (slug: string) => void;
    onError: (error: string) => void;
}

export default function PayPalButton({ cardData, onSuccess, onError }: PayPalButtonProps) {
    // ... original PayPal integration ...
    // See git history for full implementation
    return null;
}
*/

export default function PayPalButton() {
    return null;
}
