# Testing Patterns

**Analysis Date:** 2026-05-30

## Test Framework

**Runner:**
- No automated test runner (Jest, Vitest) is currently configured in this project.
- No assertion libraries or test script commands exist in `package.json`.

**Current Run Command:**
- None.

## Manual Verification Flow

To verify application changes, developers must perform manual end-to-end user acceptance checks:

### 1. Web Application Verification
- Start Next.js development server:
  ```bash
  npm run dev
  ```
- Navigate to `http://localhost:3000` to test pages.
- Complete login (`/login`) and signup (`/signup`) flows to test Supabase auth routing.
- Check dashboard routes (`/dashboard`, `/analytics`, `/insights`, `/nudges`, `/settings`) for correct data fetching.

### 2. Extension Verification
- Compile Chrome Extension TypeScript files:
  ```bash
  npm run build:extension
  ```
- Load extension unpacked in Google Chrome:
  1. Open Chrome and navigate to `chrome://extensions/`.
  2. Enable "Developer mode" (top right toggle).
  3. Click "Load unpacked" (top left button).
  4. Select the `extension/dist/` directory inside the project root.
- Test logins by clicking the LifeLens Extension action button.
- Inspect the Service Worker (`background.js`) to view logs in Chrome Developer Tools.
- Validate local telemetry capture queue updates by browsing pages (e.g. `youtube.com` or `reddit.com`) and confirming background uploads.

### 3. API & Database Audits
- Check terminal logs running the Next.js dev server to verify incoming telemetry POST routes:
  - `[POST /api/events/track] saved X events`
- Access the Supabase local/cloud project database tables (`profiles`, `events`, `nudges`, `daily_insights`) to confirm rows are being populated correctly and check RLS policies block unauthorized data leakage.

## Recommended Automated Testing Architecture

If automated tests are implemented in the future, the following structure is recommended:

**1. Unit Testing API Logic:**
- Install `vitest` and `@vue/test-utils` / `@testing-library/react` for components.
- Mock the Supabase client:
  ```typescript
  vi.mock('@/lib/supabase/admin', () => ({
    createAdminClient: vi.fn(() => ({
      from: vi.fn().mockReturnThis(),
      select: vi.fn(),
      insert: vi.fn(),
    })),
  }))
  ```
- Create files with `*.test.ts` naming conventions alongside API routes.

**2. Integration Testing Extension Messages:**
- Mock `chrome.storage.local` and chrome events (`chrome.alarms.onAlarm`, `chrome.tabs.onActivated`).

**3. End-to-End browser tests:**
- Set up `Playwright` to run browser instances loading the unpacked extension to verify actual web-overlay displays and user dashboards concurrently.

---

*Testing analysis: 2026-05-30*
*Update when test patterns change*
