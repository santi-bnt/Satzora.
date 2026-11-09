# Supabase keep-alive

The GitHub Actions workflow is scheduled daily at 12:23 UTC and supports manual runs through **Actions → Supabase keep-alive → Run workflow**. It posts to the production Vercel endpoint, which opens a TLS-verified PostgreSQL connection using a dedicated login and runs only `SELECT 1 AS ok`. The workflow reports success only when that query returns the expected row. It does not access student tables or write student activity.

## Current verified status (2026-11-09)

- Production is `https://satzivo.vercel.app`.
- The latest observed GitHub run, `42712347848` (scheduled, 2026-11-09 22:29 UTC), failed in the local configuration check before making an HTTP request. The old script combined these causes: `KEEPALIVE_URL` missing/invalid or `KEEPALIVE_TOKEN` missing/short. Its logs do not reveal which secret is wrong.
- An unauthenticated POST to `https://satzivo.vercel.app/api/keepalive` returned `{"ok":false,"error":"not_configured"}` with HTTP 503. The endpoint checks configuration before authentication, so Vercel's `KEEPALIVE_DATABASE_URL` or `KEEPALIVE_TOKEN` is absent or invalid. No PostgreSQL query was made. The handler intentionally does not reveal which setting is wrong.
- The GitHub integration available to this verification cannot list Actions secret names or dispatch a workflow. Secret values are never read or printed. The exact configured values in GitHub and Vercel therefore remain unverified.

The workflow now validates the canonical production URL and distinguishes missing/invalid URL, missing/short token, redirect, HTTP 401 and HTTP 503 without logging any credential. Its local tests do not substitute for a successful run against PostgreSQL.

## Dedicated database role

Review `supabase/keepalive-role.sql` using a PostgreSQL administrator, create the `satzora_keepalive` login if it has not already been created, and set a strong password interactively with `psql`'s `\password satzora_keepalive`. Do not put the password into SQL files, commits, screenshots, or messages. The role has only database `CONNECT`, read-only transaction defaults, and a five-second statement timeout; `SELECT 1` needs no table or student-data grants. The SQL is setup guidance, not an application migration, and is not idempotent. Do not execute `CREATE ROLE` again if the role already exists.

Use the Supabase PostgreSQL pooler connection string for this dedicated role where direct connectivity is unavailable. Encode special password characters as required by a URL. Do not append `ssl*` query parameters: the endpoint configures TLS certificate verification itself. Do not use a Supabase `service_role` key.

## Required configuration

In **Vercel → Project Settings → Environment Variables**, set these for **Production**, then redeploy:

- `KEEPALIVE_DATABASE_URL`: PostgreSQL URL for `satzora_keepalive` (server-side only).
- `KEEPALIVE_TOKEN`: a separate random token, at least 32 characters.

In **GitHub → Settings → Secrets and variables → Actions → New repository secret**, set:

- `KEEPALIVE_URL`: exactly `https://satzivo.vercel.app/api/keepalive`.
- `KEEPALIVE_TOKEN`: the same random token as the Vercel variable.

Do not add either value to a `VITE_` variable, Git, or browser code. The token belongs in GitHub **Secrets**, not Variables. After configuration and Vercel redeployment, run the workflow manually. A successful run must end with `PostgreSQL read-only check succeeded.`; this message is emitted only for the expected result from the real database query.

## Failure checks and paused projects

The workflow deliberately fails on incorrect configuration, redirects, authentication errors, endpoint failures, timeouts, invalid responses, and unsuccessful PostgreSQL checks. A failed workflow alone does not prove that Supabase is paused. Check the project status in the [Supabase Dashboard](https://supabase.com/dashboard); if it is paused, use **Resume project**, wait for it to become available, and rerun the workflow.

Keep-alive does **not** guarantee that a free Supabase project will avoid an inactivity pause. GitHub scheduled runs may be delayed, and Supabase controls its pause policy. A plan not subject to inactivity pauses is required for a definitive prevention.
