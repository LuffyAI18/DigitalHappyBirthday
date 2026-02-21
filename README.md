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
- **SQLite DB** — Zero-setup local database (with Supabase migration path)

---

## 🚀 Quick Start

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

## 🚢 Vercel Deployment

### Step 1: Push to GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to [Vercel](https://vercel.com) and import your GitHub repo
2. Set environment variables:

| Variable | Value |
|---|---|
| `ADMIN_TOKEN` | A strong random string |
| `DATABASE_URL` | `./data/birthday-cards.db` |
| `BMAC_USERNAME` | Your BMAC username |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.vercel.app` |

> **⚠️ Important:** SQLite on Vercel is **ephemeral** — data resets on each deployment. For persistent production data, switch to Supabase (see below).

---

## 🔒 Security & Privacy

- **HTML Sanitization** — All user messages are sanitized server-side using `sanitize-html`
- **CSP Headers** — Content Security Policy allows only BMAC domains
- **No Financial Data Stored** — Donations are processed entirely by BMAC; we only log clicks
- **IP Anonymization** — Donation click IPs are hashed with a server-side salt
- **Rate Limiting** — In-memory rate limiter on card creation (5/min per IP)
- **Profanity Filter** — Basic wordlist filter with admin flagging
- **ADMIN_TOKEN** — Admin dashboard protected by secret token

### Data Stored

| Table | Data | PII? |
|---|---|---|
| `cards` | Card content, template, slug | Sender/recipient names |
| `replies` | Reply messages, sender name | Sender name |
| `donation_clicks` | Slug, provider, currency, amount, hashed IP | None (IP is hashed) |

### GDPR Deletion

```bash
# Soft delete
curl -X DELETE "http://localhost:3000/api/admin/card/1?token=YOUR_TOKEN"

# Hard delete (permanent)
curl -X DELETE "http://localhost:3000/api/admin/card/1?token=YOUR_TOKEN&hard=true"
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
│   ├── db.ts                       # SQLite (cards, donation_clicks, replies)
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
