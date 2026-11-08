// Deliberate deployment gate: the local, shared SQLite API is not multi-user safe.
console.error('Deployment blocked: authenticated Supabase sync is implemented, but guest mode remains local-only and the Vercel API entrypoint has not been verified in a Preview deployment. See docs/cloud-deployment.md.');
process.exitCode=1;
