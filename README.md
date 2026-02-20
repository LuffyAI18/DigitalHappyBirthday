# 🎂 Digital Happy Birthday Starter

A production-ready, open-source starter for a paid "Digital Happy Birthday / Cake Card" web product. Create beautiful animated birthday cards, accept payments via PayPal (₹19 INR), and share unique card pages.

**License:** MIT | **Price:** ₹19 INR per card | **Framework:** Next.js + TypeScript

---

## ✨ Features

- **Card Editor** — Rich message editor with emoji support, 4 template designs, customizable cakes
- **Live Preview** — Real-time card preview with Framer Motion animations
- **PayPal Checkout** — ₹19 INR payment via PayPal Sandbox/Live
- **Unique Share Pages** — Each card gets a unique URL (`/card/[slug]`)
- **Social Sharing** — WhatsApp, Telegram, X/Twitter, copy link, embed code
- **Interactive Card Experience** — Animated cake with candles, confetti burst, recipient replies
- **Admin Dashboard** — View/flag/delete cards, payment audit log, GDPR compliance
- **Security** — CSP headers, HTML sanitization, profanity filter, rate limiting
- **SQLite DB** — Zero-setup local database (with Supabase migration path)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **PayPal Developer Account** (free) for sandbox testing

### 1. Clone & Install

```bash
git clone https://github.com/your-username/digital-happy-birthday-starter.git
cd digital-happy-birthday-starter
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your PayPal sandbox credentials (see next section).

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 💳 PayPal Sandbox Setup

### Step 1: Create a PayPal Developer Account

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Sign in or create a free account
3. Navigate to **Apps & Credentials** → **Sandbox**

### Step 2: Create a Sandbox App

1. Click **Create App**
2. Name it "Birthday Cards Test"
3. Select **Merchant** account type
4. Copy the **Client ID** and **Secret**

### Step 3: Configure Environment Variables

```env
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

### Step 4: Setup Webhooks (optional but recommended)

1. In PayPal Dashboard → **Webhooks** → **Add Webhook**
2. Set the URL to your ngrok tunnel (see below) + `/api/paypal-webhook`
3. Subscribe to events:
   - `CHECKOUT.ORDER.APPROVED`
   - `PAYMENT.CAPTURE.COMPLETED`
4. Copy the **Webhook ID** to `.env`:

```env
PAYPAL_WEBHOOK_ID=your_webhook_id
```

### Step 5: Test with Sandbox Accounts

PayPal automatically creates sandbox buyer and seller accounts. Use the sandbox buyer credentials to test payments.

---

## 🔧 Local Webhook Testing (ngrok)

To test PayPal webhooks locally, use [ngrok](https://ngrok.com/):

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, tunnel to localhost:3000
ngrok http 3000
```

Copy the ngrok HTTPS URL (e.g., `https://abc123.ngrok.io`) and:

1. Set the webhook URL in PayPal Dashboard to: `https://abc123.ngrok.io/api/paypal-webhook`
2. Update `.env`:
   ```env
   NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io
   ```

---

## 🚢 Vercel Deployment

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/digital-happy-birthday-starter.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and import your GitHub repo
2. Configure environment variables in Vercel dashboard:

| Variable | Value |
|---|---|
| `PAYPAL_CLIENT_ID` | Your **live** PayPal Client ID |
| `PAYPAL_CLIENT_SECRET` | Your **live** PayPal Secret |
| `PAYPAL_WEBHOOK_ID` | Your webhook ID |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Same as PAYPAL_CLIENT_ID |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.vercel.app` |
| `ADMIN_TOKEN` | A strong random string |
| `DATABASE_URL` | `./data/birthday-cards.db` |

### Step 3: Switch to Live PayPal

In your environment, the PayPal API base automatically uses sandbox. To switch to live:

1. Use **live** credentials (not sandbox) from PayPal Dashboard → **Live**
2. Set env var: `PAYPAL_API_BASE=https://api-m.paypal.com`

> **⚠️ Important:** SQLite works on Vercel but data is **ephemeral** — it resets on each deployment. For persistent production data, switch to Supabase (see below).

---

## 🔄 Switching to Supabase (Production)

For persistent database in production:

### Step 1: Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a free project
2. Get your project URL and service role key

### Step 2: Create Tables

Run this SQL in Supabase SQL editor:

```sql
CREATE TABLE cards (
  id BIGSERIAL PRIMARY KEY,
  slug TEXT UNIQUE,
  card_json JSONB NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'pastel-heart',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id BIGSERIAL PRIMARY KEY,
  card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  paypal_order_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'created',
  amount TEXT NOT NULL DEFAULT '19.00',
  currency TEXT NOT NULL DEFAULT 'INR',
  payer_email TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE replies (
  id BIGSERIAL PRIMARY KEY,
  card_id BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sender TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Step 3: Update Code

Replace `lib/db.ts` with Supabase client calls. See comments in the file for guidance.

### Step 4: Set Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🔒 Security Notes

- **HTML Sanitization** — All user messages are sanitized server-side using `sanitize-html`
- **CSP Headers** — Content Security Policy applied via Next.js middleware
- **Secrets** — PayPal secret is never exposed to the client
- **Rate Limiting** — In-memory rate limiter on create-order (5/min per IP)
- **Profanity Filter** — Basic wordlist filter with admin flagging
- **Webhook Verification** — PayPal webhook signatures verified server-side
- **ADMIN_TOKEN** — Admin dashboard protected by secret token

### Production Recommendations

- [ ] Use Redis-based rate limiting (`@upstash/ratelimit`)
- [ ] Add Cloudflare or AWS WAF
- [ ] Enable additional CSP reporting
- [ ] Add CAPTCHA to the editor form
- [ ] Implement more comprehensive content moderation (e.g., Perspective API)

---

## 🗑️ GDPR / Data Deletion

### Delete a Card (Admin)

**Soft delete** (hide from public, retain for audit):
```bash
curl -X DELETE "http://localhost:3000/api/admin/card/1?token=YOUR_ADMIN_TOKEN"
```

**Hard delete** (permanent, GDPR compliance):
```bash
curl -X DELETE "http://localhost:3000/api/admin/card/1?token=YOUR_ADMIN_TOKEN&hard=true"
```

### Data Retention

- Cards are stored indefinitely unless deleted by admin
- Payment audit records follow the same lifecycle as cards (cascade delete)
- Replies are deleted with their parent card

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

Tests mock PayPal API responses. No real PayPal calls are made during testing.

---

## 📁 Project Structure

```
digital-happy-birthday-starter/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout + fonts + metadata
│   ├── globals.css               # Tailwind + custom theme tokens
│   ├── create/page.tsx           # Card editor
│   ├── card/[slug]/              # Card display (SSR)
│   │   ├── page.tsx
│   │   └── CardPageClient.tsx
│   ├── share/[slug]/page.tsx     # Post-payment share page
│   ├── admin/page.tsx            # Admin dashboard
│   └── api/                      # API routes
│       ├── create-order/route.ts
│       ├── capture-order/route.ts
│       ├── paypal-webhook/route.ts
│       ├── card/[slug]/route.ts
│       ├── card/[slug]/reply/route.ts
│       ├── snapshot/[slug]/route.ts
│       ├── admin/cards/route.ts
│       └── admin/card/[id]/route.ts
├── components/
│   ├── CakePreview.tsx           # SVG cake with shapes & candles
│   ├── LottieAnimation.tsx       # Lottie wrapper
│   ├── PayPalButton.tsx          # PayPal checkout button
│   └── ShareButtons.tsx          # Social share buttons
├── designs/
│   └── templates.ts              # 4 template design specs
├── lib/
│   ├── db.ts                     # SQLite database layer
│   ├── paypal.ts                 # PayPal API helpers
│   ├── sanitize.ts               # HTML sanitization
│   ├── slug.ts                   # Slug generation
│   ├── profanity.ts              # Profanity filter
│   └── rate-limit.ts             # Rate limiter
├── tests/
│   ├── create-order.test.ts
│   └── webhook.test.ts
├── storage/                      # Local file uploads (dev)
├── middleware.ts                  # Security headers + admin auth
├── .env.example
├── .github/workflows/test.yml
├── LICENSE                        # MIT
└── README.md
```

---

## 🎨 Template Designs

| Template | Fonts | Colors | Lottie Keywords |
|---|---|---|---|
| **Pastel Heart** | Poppins + Playfair Display | `#FFF7FB` `#FF9CCF` `#E85D9C` | heart burst, candle flicker, pastel confetti |
| **Bold Neon** | Inter + Roboto Slab | `#0A0A1A` `#00FFAA` `#FF3CAC` | neon spark, animated sprinkles, glow candles |
| **Classic Elegant** | Merriweather + Lato | `#FFFCF5` `#C9A84C` `#8B6914` | gold sparkle, slow confetti, flicker candle |
| **Cute Cartoon** | Baloo 2 + Nunito | `#FFF9E6` `#4ECDC4` `#FF6B6B` | cartoon cake, confetti pop, cute candle |

### Adding Lottie Animations

1. Search [LottieFiles](https://lottiefiles.com) for the keywords above
2. Download free JSON files
3. Place in `public/lottie/` directory
4. Use `<LottieAnimation animationPath="/lottie/your-file.json" />`

---

## ✅ Completion Checklist

### Completed ✅

- [x] Next.js App Router + TypeScript setup
- [x] Tailwind CSS with template color tokens
- [x] Landing page with CTA
- [x] Card editor with all fields
- [x] Live preview pane
- [x] Template selector (4 designs)
- [x] Font and color selector
- [x] Cake shape/icing/candle options
- [x] Confetti and music toggles
- [x] PayPal Checkout integration (INR 19)
- [x] Order creation and capture APIs
- [x] Webhook verification with idempotency
- [x] SQLite database (cards, payments, replies)
- [x] Unique slug generation (base62, 8-char)
- [x] Card display page (SSR + interactive)
- [x] Confetti animation on card open
- [x] Reply system for recipients
- [x] Share page with social buttons
- [x] Admin dashboard (token-protected)
- [x] Card flagging and deletion (soft + GDPR hard)
- [x] Payment audit log
- [x] HTML sanitization (sanitize-html)
- [x] Profanity filter
- [x] Rate limiting (in-memory)
- [x] CSP + security headers (middleware)
- [x] Dynamic OG meta tags
- [x] Unit tests (vitest)
- [x] GitHub Actions CI
- [x] MIT License
- [x] .env.example

### TODOs for Production Hardening

- [ ] Add Lottie JSON assets (download from LottieFiles using template keywords)
- [ ] Switch SQLite → Supabase/PostgreSQL for persistent storage
- [ ] Switch local storage → Supabase Storage / S3
- [ ] Add Redis rate limiting
- [ ] Implement PNG snapshot generation (Puppeteer/Playwright)
- [ ] Add CAPTCHA to editor form
- [ ] Set up production PayPal (live credentials)
- [ ] Add comprehensive content moderation
- [ ] Add WAF (Cloudflare/AWS)
- [ ] Add monitoring and error tracking (Sentry)
- [ ] Implement background music player
- [ ] Add more emoji/sticker options
- [ ] Add multi-language support

---

## 📄 License

MIT — See [LICENSE](./LICENSE) for details.
