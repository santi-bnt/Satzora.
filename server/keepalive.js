import {createHash,timingSafeEqual} from 'node:crypto';
import pg from 'pg';

const digest=value=>createHash('sha256').update(value).digest();
export function createKeepaliveHandler({env=process.env,makeClient=options=>new pg.Client(options)}={}){
 return async function keepalive(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({ok:false,error:'method_not_allowed'});
  const secret=env.KEEPALIVE_TOKEN,connectionString=env.KEEPALIVE_DATABASE_URL;
  if(!secret||secret.length<32||!connectionString)return res.status(503).json({ok:false,error:'not_configured'});
  try{const url=new URL(connectionString);if(!['postgres:','postgresql:'].includes(url.protocol)||!url.hostname||[...url.searchParams.keys()].some(k=>k.toLowerCase().startsWith('ssl')))throw new Error();}catch{return res.status(503).json({ok:false,error:'not_configured'});}
  const authorization=typeof req.headers.authorization==='string'?req.headers.authorization:'';
  const provided=authorization.startsWith('Bearer ')?authorization.slice(7):'';
  if(!provided||!timingSafeEqual(digest(provided),digest(secret)))return res.status(401).json({ok:false,error:'unauthorized'});
  let client;
  try{
   client=makeClient({connectionString,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:5000,query_timeout:5000,statement_timeout:5000});
   await client.connect();
   const result=await client.query('SELECT 1 AS ok');
   if(result.rows?.length!==1||result.rows[0]?.ok!==1)throw new Error('unexpected_result');
   return res.status(200).json({ok:true,check:'postgres'});
  }catch{
   // Do not expose database hosts, connection details, passwords or provider errors.
   return res.status(503).json({ok:false,error:'database_unavailable'});
  }finally{if(client)try{await client.end();}catch{}}
 };
}
export default createKeepaliveHandler();
