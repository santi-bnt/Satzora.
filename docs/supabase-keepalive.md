# Supabase Keep-Alive

The `.github/workflows/supabase-keepalive.yml` workflow is scheduled daily at 12:23 UTC and can also be started from **Actions → Supabase keep-alive → Run workflow**. It sends an authenticated POST to the Vercel endpoint, which opens a TLS-protected PostgreSQL connection and runs only `SELECT 1 AS ok`. Success is returned only when PostgreSQL responds with the expected result. It does not read or modify student data. The workflow fails on missing configuration, database failure, or an invalid response. Internal errors, URLs, and credentials are not printed.

**Current status:** Satzora is live at [satzora-green.vercel.app](https://satzora-green.vercel.app), but Keep-Alive is not configured or verified. `KEEPALIVE_DATABASE_URL` and `KEEPALIVE_TOKEN` are missing from Vercel; `KEEPALIVE_URL` and `KEEPALIVE_TOKEN` are not configured as GitHub Actions secrets. `satzora.vercel.app` is already in use by another Vercel project. Do not enable or manually run the workflow until the variables and dedicated role below are configured.

## Database role

1. Review `supabase/keepalive-role.sql` using an administrative connection and create the `satzora_keepalive` role. Set a strong random password with `\password satzora_keepalive` in a secure `psql` session. Do not put the password in the SQL file, commits, screenshots, or messages. The role defaults to read-only transactions and receives no student-table access.
2. PostgreSQL grants permissions to `PUBLIC`, which roles without `INHERIT` may still receive. Audit the project's existing `PUBLIC` permissions before using this role. The script does not revoke global privileges or guarantee that no unrelated functions are executable. Restrict any unneeded privilege without affecting the application.
3. Get a Supabase pooler connection compatible with the role and use the correct pooler username for the project. The connection URL must use `postgresql://` and must not include `ssl*` query parameters; the endpoint enforces TLS verification. Do not use `service_role`.

## Secrets and environment variables

In **Vercel → Project Settings → Environment Variables**, add these for Production:

- `KEEPALIVE_DATABASE_URL`: the PostgreSQL connection URL for the dedicated role, including its password. Server-side only.
- `KEEPALIVE_TOKEN`: a separate random token of at least 32 characters.

In **GitHub → Settings → Secrets and variables → Actions**, add:

- `KEEPALIVE_URL`: `https://satzora-green.vercel.app/api/keepalive`.
- `KEEPALIVE_TOKEN`: the same token configured in Vercel.

Do not use a `VITE_` prefix or place these values in Git or browser code. Changing Vercel variables requires a new deployment. Enable GitHub Actions failure notifications. The job logs only success or a generic error and does not follow redirects that could leak the token.

## Verify and resume a paused project

After configuring the role and secrets, redeploy Vercel, manually run the GitHub Actions workflow, and confirm that it succeeds. Also verify that a request without a token returns 401 and that an invalid database connection causes the workflow to fail.

A failed check can be caused by credentials, connectivity, Vercel, or a paused project; failure alone does not prove the project is paused. To check, open the [Supabase Dashboard](https://supabase.com/dashboard), select the organization and project, and look for a paused status. If it is paused, select **Resume project**, then run the workflow again.

Scheduled GitHub jobs can be delayed, and Supabase may change its criteria. Keep-Alive **does not guarantee** that a free project will avoid inactivity pauses. According to [Supabase's free-project pausing guidance](https://supabase.com/docs/guides/platform/free-project-pausing), paid plans are not subject to automatic inactivity pausing.