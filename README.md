# 🎂 Digital Happy Birthday Starter

A production-ready, open-source starter for a **free** "Digital Happy Birthday / Cake Card" web product. Create beautiful animated birthday cards, share unique card pages, and optionally accept donations via Buy Me a Coffee.

**License:** MIT | **Price:** Free | **Framework:** Next.js 16 + TypeScript

---

## ✨ Features

- **Card Editor** — Rich message editor with emoji support, 4 template designs, customizable cakes
- **Live Preview** — Real-time card preview with Framer Motion animations
- **Free Card Creation** — No payment required to create and share cards
- **Donate Page** — Optional "Support the developer" page after card creation (Buy Me a Coffee)
- **Region-Based Pricing** — Detects visitor's locale for INR/USD/EUR donation amounts
- **Unique Share Pages** — Each card gets a unique URL (`/card/[slug]`)
- **Social Sharing** — WhatsApp, Telegram, X/Twitter, copy link, embed code
- **Interactive Card Experience** — Animated cake with candles, confetti burst, recipient replies
- **Admin Dashboard** — View/flag/delete cards, donation click analytics, GDPR compliance
- **Security** — CSP headers, HTML sanitization, profanity filter, rate limiting
- **Dual DB Support** — SQLite for local dev, **Supabase (PostgreSQL)** for production

---

## 🚀 Quick Start (Local Dev)

### Prerequisites

- **Node.js 18+** and npm

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

Edit `.env` with your settings:

| Variable | Required | Description |
|---|---|---|
| `ADMIN_TOKEN` | **Yes** | Secret token for admin dashboard |
| `DATABASE_URL` | **Yes** | SQLite file path (default: `./data/birthday-cards.db`) |
| `BMAC_USERNAME` | Recommended | Your Buy Me a Coffee username |
| `NEXT_PUBLIC_BASE_URL` | Optional | Base URL for meta tags (default: `http://localhost:3000`) |

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** For local development, SQLite is used automatically — no Supabase credentials needed.

---

## 🎯 User Flow

```
1. User visits /create
2. Fills in card details (to, message, from, template, cake options)
3. Clicks "Complete & Save Card"
4. POST /api/cards → sanitize, check profanity, generate slug, save to DB
5. Redirect to /card/[slug]/donate
6. User sees donation options (₹9/₹29/₹49 or $1/$3/$5 or €1/€3/€5)
7. Click "Buy Me a Coffee" → opens BMAC in new tab (tracked via POST /api/donations/track)
8. Click "Skip & view card →" to see the card immediately
9. Card is accessible at /card/[slug] forever
```

---

## 🚢 Production Deployment with Supabase + Vercel

> **This is the recommended way to run in production.** SQLite on Vercel is ephemeral (data resets on deploy). Supabase gives you a persistent PostgreSQL database for free.

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in / sign up
2. Click **"New Project"**
3. Choose an organization, give it a name (e.g., `birthday-cards`), set a database password, pick your region
4. Wait for the project to initialize (~30 seconds)

### Step 2: Create All Tables (SQL Editor)

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste the following SQL and click **"Run"**:

```sql
-- =============================================================
-- 🎂 Digital Happy Birthday — Supabase Schema
-- =============================================================
-- Run this ONCE in the Supabase SQL Editor to create all tables.
-- =============================================================

-- 1. Cards table
CREATE TABLE IF NOT EXISTS cards (
  id          BIGSERIAL PRIMARY KEY,
  slug        TEXT UNIQUE,
  card_json   JSONB NOT NULL,
  template_id TEXT NOT NULL DEFAULT 'pastel-heart',
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Payments table (legacy — for PayPal re-enablement)
CREATE TABLE IF NOT EXISTS payments (
  id              BIGSERIAL PRIMARY KEY,
  card_id         BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  paypal_order_id TEXT UNIQUE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'created',
  amount          TEXT NOT NULL DEFAULT '19.00',
  currency        TEXT NOT NULL DEFAULT 'INR',
  payer_email     TEXT,
  raw_response    TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Replies table
CREATE TABLE IF NOT EXISTS replies (
  id         BIGSERIAL PRIMARY KEY,
  card_id    BIGINT NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  sender     TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Donation click analytics
CREATE TABLE IF NOT EXISTS donation_clicks (
  id         BIGSERIAL PRIMARY KEY,
  card_slug  TEXT NOT NULL,
  provider   TEXT NOT NULL DEFAULT 'bmac',
  currency   TEXT NOT NULL DEFAULT 'USD',
  amount     TEXT NOT NULL DEFAULT '0',
  ip_hash    TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cards_slug ON cards(slug);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_donation_clicks_slug ON donation_clicks(card_slug);
```

4. You should see **"Success. No rows returned"** — that means all 4 tables were created.

### Step 3: (Recommended) Enable Row Level Security (RLS)

Still in the **SQL Editor**, run this:

```sql
-- =============================================================
-- Row Level Security (RLS) — Service Role bypasses these
-- =============================================================
-- The app uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- But enabling RLS is best practice to prevent accidental
-- exposure via the anon key.
-- =============================================================

ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_clicks ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (already implicit, but explicit is safer)
CREATE POLICY "Service role has full access to cards"
  ON cards FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to payments"
  ON payments FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to replies"
  ON replies FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role has full access to donation_clicks"
  ON donation_clicks FOR ALL
  USING (auth.role() = 'service_role');
```

### Step 4: Get Your API Credentials

1. In Supabase dashboard, go to **Settings → API** (or **Project Settings → API**)
2. You need two values:

| Value | Where to find it |
|---|---|
| **Project URL** | Under "Project URL" — looks like `https://abcdef123.supabase.co` |
| **service_role key** | Under "Project API keys" → `service_role` (click "Reveal") |

> ⚠️ **Never expose your `service_role` key in client-side code.** It bypasses RLS and has full DB access. It's only used server-side.

### Step 5: Set Environment Variables on Vercel

1. Push your code to GitHub:
   ```bash
   git init && git add . && git commit -m "Initial commit"
   git remote add origin https://github.com/your-username/your-repo.git
   git push -u origin main
   ```

2. Go to [Vercel](https://vercel.com) and import your GitHub repo

3. In **Settings → Environment Variables**, add:

   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | `https://your-project.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` |
   | `ADMIN_TOKEN` | A strong random string (e.g., `openssl rand -hex 32`) |
   | `BMAC_USERNAME` | Your Buy Me a Coffee username |
   | `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.vercel.app` |

4. Click **Deploy**

> 💡 **Auto-detection:** The app detects `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` at runtime. When both are set, it uses Supabase. When neither is set, it falls back to SQLite (local dev).

### Step 6: Verify It's Working

After deployment:

1. **Create a card**: Visit `https://yourdomain.vercel.app/create` and create a test card
2. **Check Supabase**: Go to your Supabase dashboard → **Table Editor** → `cards` table — you should see the new row
3. **View the card**: Click the generated link to confirm the card displays correctly
4. **Test admin**: Visit `https://yourdomain.vercel.app/api/admin/cards?token=YOUR_TOKEN`

---

## ☕ Buy Me a Coffee Setup

1. Create a free account at [buymeacoffee.com](https://www.buymeacoffee.com)
2. Set your username in `.env`:
   ```env
   BMAC_USERNAME=your-username
   ```
3. Donation buttons will link to `https://www.buymeacoffee.com/your-username`

> **Note:** If `BMAC_USERNAME` is not set, the donate page will show a warning. Cards are still created normally — donations are always optional.

---

## 🌍 Region/Currency Detection

The donate page automatically detects the visitor's region and shows appropriate amounts:

| Region | Currency | Amounts |
|---|---|---|
| India | INR ₹ | ₹9, ₹29, ₹49 |
| US / Default | USD $ | $1, $3, $5 |
| Europe | EUR € | €1, €3, €5 |

Detection uses `navigator.language` and `Intl.DateTimeFormat` timezone — no API key required.

---

## 🔒 Security & Privacy

- **HTML Sanitization** — All user messages are sanitized server-side using `sanitize-html`
- **CSP Headers** — Content Security Policy allows only BMAC domains
- **No Financial Data Stored** — Donations are processed entirely by BMAC; we only log clicks
- **IP Anonymization** — Donation click IPs are hashed with a server-side salt
- **Rate Limiting** — In-memory rate limiter on card creation (5/min per IP)
- **Profanity Filter** — Basic wordlist filter with admin flagging
- **ADMIN_TOKEN** — Admin dashboard protected by secret token
- **RLS Enabled** — Supabase Row Level Security prevents accidental data exposure

### Data Stored

| Table | Data | PII? |
|---|---|---|
| `cards` | Card content, template, slug | Sender/recipient names |
| `replies` | Reply messages, sender name | Sender name |
| `donation_clicks` | Slug, provider, currency, amount, hashed IP | None (IP is hashed) |

### GDPR Deletion

```bash
# Soft delete
curl -X DELETE "https://yoursite.com/api/admin/card/1?token=YOUR_TOKEN"

# Hard delete (permanent)
curl -X DELETE "https://yoursite.com/api/admin/card/1?token=YOUR_TOKEN&hard=true"
```

---

## 🧪 Testing

```bash
npm test          # Run all tests
npm run test:watch # Watch mode
```

Tests cover: card creation, sanitization, profanity filtering, slug generation, donation tracking, and IP anonymization.

---

## 📁 Project Structure

```
├── app/
│   ├── page.tsx                    # Landing page
│   ├── create/page.tsx             # Card editor (free)
│   ├── card/[slug]/                # Card display
│   │   ├── page.tsx                # SSR card page
│   │   ├── CardPageClient.tsx      # Interactive card
│   │   └── donate/                 # Donate page
│   │       ├── page.tsx            # SSR donate wrapper
│   │       └── DonatePageClient.tsx # Donate UI
│   ├── admin/page.tsx              # Admin dashboard
│   └── api/
│       ├── cards/route.ts          # POST — free card creation
│       ├── donations/track/route.ts # POST — donation click tracking
│       ├── card/[slug]/route.ts    # GET — card data
│       ├── create-order/route.ts   # DISABLED (PayPal legacy)
│       ├── capture-order/route.ts  # DISABLED (PayPal legacy)
│       └── paypal-webhook/route.ts # DISABLED (PayPal legacy)
├── lib/
│   ├── db.ts                       # Auto-selecting DB proxy (Supabase or SQLite)
│   ├── db-supabase.ts              # Supabase (PostgreSQL) — async
│   ├── db-sqlite.ts                # SQLite (better-sqlite3) — local dev
│   ├── detectCurrency.ts           # Client-side currency detection
│   ├── sanitize.ts                 # HTML sanitization
│   ├── slug.ts                     # Slug generation
│   ├── profanity.ts                # Profanity filter
│   └── rate-limit.ts               # Rate limiter
├── tests/
│   ├── create-card.test.ts         # Card creation tests
│   └── donation-track.test.ts      # Donation tracking tests
├── .env.example
└── README.md
```

### Database Architecture

```
                      ┌──────────────────┐
                      │    lib/db.ts      │ ← Public API (all files import this)
                      │  Auto-detecting   │
                      │      proxy        │
                      └───────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼                               ▼
   ┌─────────────────┐          ┌──────────────────────┐
   │  lib/db-sqlite.ts│          │  lib/db-supabase.ts   │
   │  (better-sqlite3)│          │  (@supabase/supabase-js)│
   │  Local dev only  │          │  Production (async)   │
   └─────────────────┘          └──────────────────────┘
```

When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set → Supabase is used.
Otherwise → SQLite is used (zero setup for local development).

---

## 🔁 Re-enabling PayPal (Optional)

The original PayPal ₹19 checkout flow is preserved in commented-out code. To re-enable:

1. Set `FEATURE_FLAG_PAYPAL=true` in `.env`
2. Restore `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
3. Uncomment code in: `create-order/route.ts`, `capture-order/route.ts`, `paypal-webhook/route.ts`, `PayPalButton.tsx`
4. Update `middleware.ts` CSP to allow PayPal domains

---

## 📄 License

MIT — See [LICENSE](./LICENSE) for details.
