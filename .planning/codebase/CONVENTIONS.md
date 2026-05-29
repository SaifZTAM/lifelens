# Coding Conventions

**Analysis Date:** 2026-05-30

## Naming Patterns

**Files:**
- PascalCase for React components: `Logo.tsx`, `Sidebar.tsx`.
- kebab-case for generic TypeScript files or scripts: `use-mouse-position-ref.ts`, `build.mjs`.
- lowercase/Next router conventions for router pages and routes: `page.tsx`, `route.ts`, `layout.tsx`.

**Functions:**
- camelCase for generic functions: `calcRiskScore`, `classifyCategory`, `createClient`, `sendEvents`.
- PascalCase for React component names: `LandingPage`, `BrowserMockup`, `Sidebar`.

**Variables:**
- camelCase for variable names: `authHeader`, `token`, `eventsData`, `riskScore`.
- UPPER_SNAKE_CASE for configurations/constants: `API_BASE`, `BATCH_INTERVAL_SECONDS`, `NUDGES`.

**Types:**
- PascalCase for types and interfaces: `EventPayload`, `EventBatch`, `EventRow`.
- Explicit types on variables where implicit typing is not sufficient or when casting (e.g., `body.events as EventPayload[]`).

## Code Style

**Formatting:**
- Indentation: 2 spaces.
- Semicolons: Omitted in client application files and Chrome extension scripts, but occasionally used in SQL setup scripts.
- Quotes: Single quotes for imports and string literals in code (`'use client'`, `'next/server'`), double quotes inside HTML markup/JSX attributes.

**Linting:**
- Configured via ESLint (`eslint.config.mjs` extending `eslint-config-next`).
- Executable via `npm run lint`.

## Import Organization

**Order:**
1. Next.js & React Core Hooks (`next/link`, `react`, `next/navigation`).
2. Supabase clients and helper imports (`@supabase/ssr`, `@supabase/supabase-js`, `@/lib/supabase/*`).
3. External UI/Icon packages (`lucide-react`, `openai`).
4. Project components and hooks (`@/components/*`, `@/hooks/*`).
5. Types and styles (`import type {}`, `@/app/globals.css`).

**Path Aliases:**
- `@/*` mapped to project root (e.g., `@/lib/supabase/admin`, `@/components/Logo`).

## Error Handling

**Strategy:** Fail gracefully, notify users, and retain raw queue states.
- **REST Endpoints:** Checked inputs return `400 Bad Request` or `401 Unauthorized` with clear JSON logs:
  ```typescript
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  ```
- **Try/Catch Blocks:** Wrap critical external integrations (OpenAI calls, database commands) inside try/catch blocks:
  ```typescript
  try {
    const res = await fetch(...)
  } catch (err) {
    console.error('Context log message', err)
  }
  ```
- **Local queueing:** If telemetry requests fail, the client extension retains data queue arrays and prepends them back to the active queue:
  ```typescript
  catch {
    eventQueue = [...batch, ...eventQueue]
  }
  ```

## Logging

**Framework:**
- Standard `console.log` and `console.error` statements.
- Pre-fixed logs indicating route and action status for ease of CLI log parsing:
  - `console.log('[POST /api/events/track] start')`
  - `console.error('[POST /api/events/track] db error', error.message)`

## Module Design

**Exports:**
- Default exports for Next.js routing files (`page.tsx`, `layout.tsx`).
- Named exports for library utility loaders (`createClient`, `createAdminClient`, `LogoFull`).

---

*Convention analysis: 2026-05-30*
*Update when patterns change*
