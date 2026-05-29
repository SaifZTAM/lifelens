# Technology Stack

**Analysis Date:** 2026-05-30

## Languages

**Primary:**
- TypeScript 5.x - All Next.js application pages, API routes, layout components, and Chrome extension source files (`extension/background.ts`, `extension/content.ts`, `extension/popup.ts`).

**Secondary:**
- JavaScript/ESM - Bundler/compiler configuration scripts like `extension/build.mjs`, `eslint.config.mjs`, `postcss.config.mjs`, and `.gitignore`.

## Runtime

**Environment:**
- Node.js 20.x (LTS) - Local development environment and compilation/build step.
- Browser runtime (V8 / Chromium) - Executes the Chrome Extension and Next.js client-side frontend code.

**Package Manager:**
- npm 10.x
- Lockfile: `package-lock.json` present.

## Frameworks

**Core:**
- Next.js 16.2.4 - Full-stack framework (using App Router) that runs the web interface and API routing.
- React 19.2.4 - UI library powering Next.js frontend pages.

**Styling:**
- TailwindCSS v4.x - Modern CSS utility framework.
- PostCSS 8.x - Used by Tailwind CSS for css compiling.

**Build/Dev:**
- esbuild 0.28.0 - Fast JS/TS bundler used to compile the Chrome Extension files from TypeScript into browser-ready JavaScript.
- TypeScript compiler - Type checks all Next.js code.

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.105.1 & `@supabase/ssr` 0.10.2 - Authenticates users and connects client/server requests to the Supabase database.
- `openai` 6.35.0 - Integrates OpenAI model `gpt-4o-mini` to dynamically generate focus nudges and daily summaries.
- `@pinecone-database/pinecone` 7.2.0 - Client library for Pinecone vector database (used for behavior indexing and semantic search).
- `framer-motion` 12.38.0 & `motion` 12.38.0 - UI transition and micro-animation library.

**Infrastructure/Utilities:**
- `lucide-react` 1.14.0 - SVG Icon package for sidebar, buttons, and state indicators.
- `tailwind-merge` 3.5.0 & `clsx` 2.1.1 - Helper utilities for merging and switching Tailwind CSS classes dynamically.

## Configuration

**Environment:**
- `.env.local` - Local environment secrets:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `OPENAI_API_KEY`
  - `PINECONE_API_KEY`
  - `PINECONE_INDEX`

**Build & Compilation:**
- `tsconfig.json` - Custom TS options for Next.js app and client code.
- `extension/build.mjs` - Custom esbuild script to bundle the extension's `background.ts`, `content.ts`, and `popup.ts` to `extension/dist/`.
- `postcss.config.mjs` - Integrates TailwindCSS post-processing.
- `eslint.config.mjs` - Linting configuration for codebase code quality.

## Platform Requirements

**Development:**
- macOS/Linux/Windows with Node.js 20+ installed.
- Google Chrome or a Chromium-based browser supporting manifest version 3 extensions.

**Production:**
- Vercel (or node-supported Next.js host) - Deployment target for Next.js web application.
- Supabase (PostgreSQL + Auth) - Managed cloud backend database and authentication.
- Pinecone Cloud - Vector index hosting.

---

*Stack analysis: 2026-05-30*
*Update after major dependency changes*
