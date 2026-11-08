// Deliberate deployment gate: the local, shared SQLite API is not multi-user safe.
console.error('Deployment blocked: Supabase authentication, per-user storage, guest import and cross-device synchronization are not implemented or verified. See docs/cloud-deployment.md.');
process.exitCode=1;
