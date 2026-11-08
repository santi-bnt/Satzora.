import {DatabaseSync} from 'node:sqlite';
import {createApp} from '../server/index.js';

const app=createApp(new DatabaseSync(':memory:'));

// Vercel's file based Node functions only expose one dynamic path segment in
// this non-Next.js project. vercel.json rewrites nested /api/a2/* requests
// here, and this restores the original Express URL before routing.
export default function handler(req,res){
  const url=new URL(req.url,'https://satzora.invalid');
  const route=url.searchParams.get('__satzora_route');
  if(!route||!route.startsWith('a2/'))return res.status(404).json({error:'not_found'});
  url.searchParams.delete('__satzora_route');
  req.url=`/api/${route}${url.searchParams.size?`?${url.searchParams}`:''}`;
  return app(req,res);
}
