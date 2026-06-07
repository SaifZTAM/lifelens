# Architecture

**Analysis Date:** 2026-05-30

## Pattern Overview

**Overall:** Client-Server Extension-Backed Web Application.
LifeLens is structured as an interactive web dashboard (Next.js App Router) supported by a background telemetry harvester (Chrome Extension) communicating securely via HTTP REST endpoints.

**Key Characteristics:**
- **Asynchronous, Alarmed Telemetry Collection:** Browser event telemetry is queued locally in the Chrome Extension and dispatched every 30 seconds.
- **AI-Driven Edge Logic:** A risk scoring algorithm determines when the user is losing focus, spawning asynchronous OpenAI completions for context-aware notifications.
- **Secure Cross-Origin Client Isolation:** Standard JWT-based headers authenticate the extension to the Next.js backend, which leverages Row-Level Security (RLS) policies inside Supabase.

## Layers

**Client Layer (Chrome Extension):**
- **Purpose:** Observes user tabs and schedules periodic payload uploads.
- **Contains:**
  - `extension/background.ts` - Orchestrator running as a service worker. Harvester loop using Chrome Alarms.
  - `extension/content.ts` - UI injector, displays `SHOW_NUDGE` modals on active pages.
  - `extension/popup.ts` - Login UI inside Chrome's extension dropdown.
- **Depends on:** Chrome extension APIs (alarms, storage, notifications).
- **Used by:** Direct browser actions.

**API Layer (Next.js Route Handlers):**
- **Purpose:** Accepts client actions, runs AI evaluation workflows, and returns stored database metrics.
- **Contains:**
  - `app/api/auth/token/route.ts` - Signs in extension users and returns JWTs.
  - `app/api/events/track/route.ts` - Unpacks and records telemetry events.
  - `app/api/nudges/generate/route.ts` - Calculates user risk scores and compiles focus nudges using OpenAI.
  - `app/api/insights/daily/route.ts` - Generates a daily summary.
  - `app/api/user/data/route.ts` - Dashboard exporter and data purger.
- **Depends on:** Supabase admin client (`lib/supabase/admin.ts`), OpenAI SDK.
- **Used by:** Chrome extension background workers, dashboard React components.

**Web Dashboard Layer (Next.js Pages & Layouts):**
- **Purpose:** User authentication, telemetry visualization, configuration settings.
- **Contains:**
  - `app/page.tsx` - Public marketing landing page.
  - `app/login/page.tsx` & `app/signup/page.tsx` - Auth client screens.
  - `app/(dashboard)/*` - Protected user analytics dashboard layouts.
- **Depends on:** React, Lucide Icons, Framer Motion, Supabase server/client connections.

**Data Persistence Layer (Supabase PostgreSQL):**
- **Purpose:** Persistent storage for user metrics and metadata.
- **Contains:**
  - `profiles` table - Focus start/end times and tracking toggles.
  - `events` table - Raw browser telemetry rows.
  - `nudges` table - Log of AI-generated alerts and user feedback.
  - `daily_insights` table - Daily summarized AI coach text.
- **Depends on:** Supabase database engine, Auth trigger handlers.
- **Used by:** API routes and server clients.

## Data Flow

### Telemetry Event Loop
1. The user switches to or updates a tab in their browser.
2. `extension/background.ts` logs the active start timestamp.
3. Every 30 seconds, `sendEvents` alarm runs:
   - Aggregates active time duration and tab switch counts.
   - Pushes telemetry events to `/api/events/track` via standard POST request.
   - On success, flushes queue; on failure, queues events for retry.

### AI Nudge Trigger
1. Every 120 seconds, the `checkNudge` alarm runs in `extension/background.ts`.
2. It hits `POST /api/nudges/generate` with the JWT.
3. The API fetches the last 30 minutes of telemetry from the `events` table.
4. `calcRiskScore()` calculates the behavioral intensity, context weight (distractions like Twitter/Reddit), and time sensitivity (work hours vs. sleep hours).
5. If the risk score $\ge 0.65$:
   - The route requests a coach message from `gpt-4o-mini` based on the category.
   - Inserts the new row into the `nudges` table.
   - Returns the nudge object to the Chrome Extension.
6. The Chrome Extension background worker triggers a native `chrome.notifications.create` toast.

### User Data Retrieval (Web Dashboard)
1. User logs into the Web Dashboard at `/dashboard`.
2. Pages (e.g. Overview) send requests to `/api/user/data`.
3. The GET handler queries the database for user events, nudges, and daily insights.
4. Returns payload to React frontend, which paints analytics charts and logs.

## Key Abstractions

**Supabase Client Factory:**
- **Purpose:** Provides custom database connections depending on execution context.
- **File References:**
  - `lib/supabase/client.ts` - Browser-safe environment.
  - `lib/supabase/server.ts` - Server component/action context supporting cookie headers.
  - `lib/supabase/admin.ts` - Admin execution (bypasses RLS).

**AI Coach Model Engine:**
- **Purpose:** Standardizes instructions for GPT-based coach feedback.
- **Files:** `app/api/insights/daily/route.ts`, `app/api/nudges/generate/route.ts`.

## Entry Points

**Web Entry:**
- Location: `app/page.tsx`
- Triggers: User visits root URL.
- Responsibilities: Paints landing page, redirects to auth.

**Extension Service Worker:**
- Location: `extension/background.ts` (bundles to `extension/dist/background.js`)
- Triggers: Chrome browser startup, tabs changed, alarm timers.
- Responsibilities: Harvests stats, batches payload, polls nudges.

**Auth Token Exchange:**
- Location: `app/api/auth/token/route.ts`
- Triggers: Chrome extension popup inputs login info.
- Responsibilities: Validates password, issues extension API token.

## Error Handling

**Strategy:** Fail gracefully and protect telemetry state.
- **Telemetry Buffering:** If Next.js server is unreachable, the extension background queue retains events to prevent data loss.
- **API Token Verification:** Invalid tokens return standard `401 Unauthorized` responses.
- **Catch blocks:** API routes use standard try-catch blocks returning fallback responses (e.g. standard daily insight texts).

---

*Architecture analysis: 2026-05-30*
*Update when major patterns changes*
