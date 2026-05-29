# LifeLens

> Your browser knows when you're losing focus.

> **Note:** The Chrome extension is still in active development and not yet production-ready.

LifeLens is a privacy-first productivity intelligence tool — a Chrome extension paired with a Next.js web app that watches your browsing behavior in real time, scores distraction risk every 30 seconds, and sends AI-generated nudges before the spiral starts.

---

## What it does

| Layer | What happens |
|---|---|
| **Chrome Extension** | Tracks active tabs, session duration, and tab switches silently in the background |
| **Risk Engine** | Scores behavior every 30 seconds using OpenAI — detects distraction, procrastination, and burnout patterns |
| **Nudges** | Delivers context-aware messages timed to interrupt just enough to redirect attention |
| **Daily Insights** | Generates one AI summary per evening — where your time actually went, no noise |
| **Dashboard** | Visualizes your focus patterns, nudge history, and behavioral trends |

---

## Tech stack

**Web app**
- [Next.js 16](https://nextjs.org/) (App Router) + React 19 + TypeScript
- [Supabase](https://supabase.com/) — auth, Postgres database, Row Level Security
- [Pinecone](https://www.pinecone.io/) — vector storage for behavioral embeddings
- [OpenAI](https://openai.com/) — nudge generation and daily insight summaries
- [Tailwind CSS v4](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) — UI and animations

**Chrome Extension**
- Manifest V3 — background service worker, content scripts, popup
- Tracks: domains, active duration, idle periods, tab switches
- Sends events to the Next.js API on a 30-second interval

---

## Project structure

```
lifelens/
├── app/
│   ├── (dashboard)/          # Authenticated app — dashboard, analytics, insights, nudges, settings
│   ├── api/
│   │   ├── auth/token/       # Extension auth token endpoint
│   │   ├── events/track/     # Ingest behavioral events from extension
│   │   ├── insights/daily/   # Generate daily AI summaries
│   │   ├── nudges/generate/  # Trigger nudge generation
│   │   └── user/data/        # User profile and settings
│   ├── login/
│   ├── signup/
│   └── page.tsx              # Landing page
├── components/
│   ├── ui/                   # Aurora bg, wave canvas, theme toggle, auth fuse
│   ├── Logo.tsx
│   └── Sidebar.tsx
├── extension/
│   ├── background.ts         # Service worker — event loop, alarm scheduling
│   ├── content.ts            # DOM activity detection
│   ├── popup.ts              # Extension popup
│   └── dist/                 # Built extension (load this in Chrome)
├── lib/supabase/             # Client, server, and admin Supabase helpers
├── supabase/schema.sql       # Full database schema
└── middleware.ts             # Auth session refresh on every request
```

---

## Database schema

Four tables, all protected by Row Level Security — users only ever see their own data.

```
profiles        — user settings (work hours, tracking toggle)
events          — raw behavioral data from the extension
nudges          — AI-generated nudges with feedback tracking
daily_insights  — one AI summary per user per day
```

---

## Getting started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com/) project
- An [OpenAI](https://openai.com/) API key
- A [Pinecone](https://www.pinecone.io/) index

### 1. Clone and install

```bash
git clone https://github.com/SaifZTAM/lifelens.git
cd lifelens
npm install
```

### 2. Set up environment variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name
```

### 3. Set up the database

In your Supabase dashboard → SQL Editor → New Query, paste and run the contents of [`supabase/schema.sql`](supabase/schema.sql).

### 4. Run the web app

```bash
npm run dev
```

App runs at `http://localhost:3000`.

### 5. Build and load the Chrome extension

```bash
npm run build:extension
```

Then in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `extension/dist/` folder

---

## Privacy

- Raw browsing history is never uploaded. Only aggregated behavioral signals (domain, duration, activity type) leave your device.
- All data is scoped to your account via Row Level Security — no one else can read it.
- Tracking can be paused in one click from the extension popup.
- No data is sold to advertisers. Ever.

---

## License

MIT
