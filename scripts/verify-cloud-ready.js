// The Supabase and Vercel Preview flows have been verified with test accounts.
// Fail closed if a Vercel deployment is missing its public Supabase config.
if (process.env.VERCEL === '1') {
  const missing=['VITE_SUPABASE_URL','VITE_SUPABASE_PUBLISHABLE_KEY'].filter(name=>!process.env[name]);
  if(missing.length){
    console.error(`Deployment blocked: missing required Vercel environment variables: ${missing.join(', ')}.`);
    process.exitCode=1;
  } else {
    console.log(`Cloud configuration verified for Vercel ${process.env.VERCEL_ENV||'deployment'}.`);
  }
}
