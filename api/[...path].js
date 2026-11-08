import {DatabaseSync} from 'node:sqlite';
import {createApp} from '../server/index.js';

// The public API's legacy SQLite routes are disabled by createApp when Vercel
// sets VERCEL. Signed-in study routes use Supabase RLS per request.
const db=new DatabaseSync(':memory:');
const app=createApp(db);
export default app;
