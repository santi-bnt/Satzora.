# Deployment and cloud status

## Current status — 8 November 2026

Production is live at **https://satzivo.vercel.app**. The domain and deployment details are verified separately from workflow and database checks.

The Vercel project `santi-bnts-projects/satzora` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` configured for Preview and Production. No service-role key, `.env.local`, or SQLite file was uploaded.

Verified against Production: the page and `/api/health` returned HTTP 200; `/api/a2/cloud-study/base` returned 401 without a token; a test account received HTTP 200 from the authenticated study API. Verified against Preview: anonymous study requests were rejected, an authenticated test account could read flashcards, and a study session was created with HTTP 201 and read back with HTTP 200 from Supabase.

Two real Supabase test accounts verified guest-data import, idempotent retries, session/flashcard persistence, and user isolation. No student accounts were used. See [verification.md](verification.md).

Nested `/api/a2/*` requests are rewritten to `api/router.js`, which restores the Express request path before routing. Authenticated web users store study data in Supabase. SQLite remains for local guests and the preserved backup; guest import is explicit and idempotent. Vercel does not use SQLite as shared user storage, so the web app requires sign-in.

## Keep-Alive is not configured

The daily GitHub Actions workflow exists but its latest run failed before requesting the endpoint. An unauthenticated production check returned `not_configured` (HTTP 503), so Vercel's `KEEPALIVE_DATABASE_URL` or `KEEPALIVE_TOKEN` is absent or invalid; the Actions log also indicates its URL or token secret is missing or invalid. No PostgreSQL query has been confirmed. Create/configure the dedicated least-privilege role and secrets as described in [supabase-keepalive.md](supabase-keepalive.md), then run the workflow manually. Keep-Alive cannot guarantee that a free Supabase project will avoid inactivity pauses.

## Local and deployment checks

The root of this repository is the Vercel project root. The project uses `vercel.json` to install with `npm ci`, check the public Supabase configuration, build with Vite, publish `dist/`, and route nested study API requests. Preview deployments remain protected by Vercel Authentication; Production is public.

The latest local verification passed 66 server/content tests, four UI tests, and the production build. The public Production page and health endpoint were checked directly without the Vercel bypass mechanism.

## Historical notes

The earlier status and setup notes below were written before the November 8, 2026 cloud integration and deployment. Current status is documented above; do not follow historical statements that say Supabase or Vercel is unconfigured.

- The project was consolidated into the repository root; SQLite and its backup remain in `data/` and are ignored by Git.
- Existing Supabase tables and RLS policies were inspected. Applied migrations were reconciled without replaying the initial schema migrations.
- Authenticated study and flashcard routes use the caller's verified JWT and Supabase RLS. Service-role credentials are not used for normal user operations.
- Environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are public client configuration. Optional `OPENAI_API_KEY`, `OPENAI_TEXT_MODEL`, `OPENAI_TRANSCRIBE_MODEL`, and `OPENAI_SPEECH_MODEL` are server-side only.

For official setup references, see [Vercel monorepo configuration](https://vercel.com/docs/monorepos) and [Supabase Auth redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls).
