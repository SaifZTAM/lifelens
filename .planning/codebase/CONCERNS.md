# Codebase Concerns

**Analysis Date:** 2026-05-30

## Tech Debt

**Bypassing RLS with Admin Client in User Data Route:**
- Issue: In the user data endpoint, database operations are performed using the Supabase admin client rather than the authenticated server client.
- Files: `app/api/user/data/route.ts` (lines 11-17, 28-34)
- Why: Implemented to easily gather multiple tables' rows in parallel without configuring individual server clients per call.
- Impact: Increases the blast radius of any coding errors (e.g. if the developer forgets to check or filter by `user.id`, RLS will not step in to protect other users' data).
- Fix approach: Refactor queries to use the cookie-backed client (`createClient()`) which enforces Supabase RLS policies directly.

**Hardcoded Host API Endpoint in Extension Background:**
- Issue: The Chrome extension hardcodes `API_BASE` to `http://localhost:3000`.
- File: `extension/background.ts` (line 3)
- Why: Early stage testing convenience.
- Impact: The extension will fail to send telemetry or fetch nudges in production unless the client extension file is manually edited before compiling.
- Fix approach: Read backend API origin dynamically from the extension's local configuration storage (allowing users or installers to customize the sync server) or use build environment configurations.

## Fragile Areas

**State Loss on Extension Service Worker Idle Termination:**
- Issue: Extension tracking state is stored in standard in-memory variables.
- File: `extension/background.ts` (lines 15-18: `activeTabId`, `activeStart`, `tabSwitchCount`)
- Why: Simple state initialization logic.
- Impact: Chrome Extension Manifest V3 background service workers are ephemeral; Chrome will periodically suspend the worker when idle. When the service worker wakes up on the next alarm, all local variables are re-initialized. This causes loss of active tab timers and resets tab switch counters to zero, leading to inaccurate telemetry logging.
- Fix approach: Persist operational variables to `chrome.storage.local` inside event listener callbacks and reload them during initialization instead of storing them as global script variables.

## Security Considerations

**All-URL Content Script Loading:**
- Risk: The extension's content script matches `<all_urls>` to inject the custom focus nudge DOM overlay.
- File: `extension/manifest.json` (line 23)
- Current mitigation: The content script only contains overlay elements and does not track passwords or private inputs.
- Recommendations: Limit permissions using `activeTab` or use standard background notifications rather than page injections on private pages (e.g. banking, credential managers) unless necessary.

## Performance Bottlenecks

**Blocking OpenAI Calls in Nudge Generation:**
- Problem: The endpoint `/api/nudges/generate` blocks execution awaiting completion of the OpenAI chat request.
- File: `app/api/nudges/generate/route.ts` (line 81)
- Measurement: 1.5s to 3.0s response latency under ordinary gpt-4o-mini generation.
- Cause: Synchronous wait for response to log the nudge category and return it to the extension.
- Improvement path: Generate and store the nudge asynchronously (e.g. queue worker or edge functions) and push notifications via websockets or return a cached result.

## Scaling Limits

**OpenAI API Cost under polling pressure:**
- Problem: The background service worker evaluates nudge generation every 120 seconds.
- Trigger: If a user has a high risk score (from distraction sites), the endpoint calls `gpt-4o-mini` to construct a refocus message.
- Limit: With 1,000+ active users, this could request hundreds of OpenAI calls per hour, accumulating API charges.
- Scaling path: Cache a list of static refocus messages locally on the client or server, selecting from the list instead of hitting OpenAI for every single nudge instance.

---

*Concerns audit: 2026-05-30*
*Update as issues are fixed or new ones discovered*
