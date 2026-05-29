# External Integrations

**Analysis Date:** 2026-05-30

## APIs & External Services

**OpenAI API:**
- Used for dynamic personal coach response and nudge message generation based on recent browser behavior categories.
  - SDK/Client: `openai` npm package v6.35.0
  - Model: `gpt-4o-mini`
  - Auth: API Key in `OPENAI_API_KEY` env var
  - Endpoints used: `chat.completions.create`

**Pinecone Vector Database:**
- Setup for indexing user behavior metrics and context for semantic similarity searches.
  - SDK/Client: `@pinecone-database/pinecone` npm package v7.2.0
  - Auth: API Key in `PINECONE_API_KEY` env var
  - Vector Index: `PINECONE_INDEX` (defaults to `lifelens-behaviors`)

**Chrome Extension to Next.js API:**
- Background service worker tracks browser tabs and periodically reports stats or requests focus checks.
  - SDK/Client: Standard `fetch` in Chrome Extension background service worker
  - Endpoints called:
    - `POST /api/events/track` - Submits active tab domain event logs
    - `POST /api/nudges/generate` - Requests a focus nudge if behavioral threshold exceeded
  - Auth: Bearer token passed in `Authorization` header (extracted from `chrome.storage.local` where user's `lifelens_token` is stored).

## Data Storage

**Databases:**
- PostgreSQL on Supabase - Primary database storing user profiles, tracked domain events, nudges history, and daily insights.
  - Connection: Managed server-side via Supabase client utilities
  - Clients:
    - Browser Client: `lib/supabase/client.ts` (`createClient`) utilizing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
    - Server Client: `lib/supabase/server.ts` (`createClient`) utilizing cookies with `@supabase/ssr` to authenticate Server Actions/Components.
    - Admin Client: `lib/supabase/admin.ts` (`createAdminClient`) bypassing Row Level Security (RLS) using `SUPABASE_SERVICE_ROLE_KEY` inside API route endpoints.
  - Schema: Initialized via `supabase/schema.sql`.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth - Handles user registration, login, and session persistence.
  - Implementation: Supabase auth client SDK.
  - Token storage: Client-side cookies mapped server-side via `@supabase/ssr`.
  - Extension sync: Chrome extension popup signs into the dashboard (or reads auth token from storage) and saves the session JWT to `chrome.storage.local` under `lifelens_token` to make authenticated calls.

## CI/CD & Deployment

**Hosting:**
- Next.js Web App: Intended for hosting on Vercel or similar Node-based platform.
- Database & Auth: Hosted on Supabase Cloud.
- Chrome Extension: Distributed manually or via Chrome Web Store (bundles into `extension/dist`).

## Environment Configuration

**Development:**
- Required env vars (defined in `.env.local`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `PINECONE_API_KEY`
  - `PINECONE_INDEX`
- Secrets Location: Local `.env.local` (not committed).

---

*Integration audit: 2026-05-30*
*Update when adding/removing external services*
