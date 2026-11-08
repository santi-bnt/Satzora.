import {createClient} from '@supabase/supabase-js';

/** Validate each access token with Supabase Auth; never trust a decoded JWT alone. */
export function createAuthenticator({url,key,makeClient=createClient}={}) {
 if(!url||!key)throw new Error('supabase_not_configured');
 let endpoint;
 try{endpoint=new URL(url);}catch{throw new Error('supabase_not_configured');}
 if(endpoint.protocol!=='https:'&&!(endpoint.protocol==='http:'&&['localhost','127.0.0.1'].includes(endpoint.hostname)))throw new Error('supabase_not_configured');
 const client=makeClient(endpoint.origin,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
 return async function authenticate(req,res,next){
  const authorization=req.headers.authorization;
  const match=typeof authorization==='string'&&authorization.match(/^Bearer ([^\s]+)$/i);
  if(!match)return res.status(401).json({error:'authentication_required'});
  try{
   const {data,error}=await client.auth.getUser(match[1]);
   if(error||!data?.user?.id)return res.status(401).json({error:'invalid_session'});
   req.auth={userId:data.user.id,accessToken:match[1]};
   return next();
  }catch{return res.status(503).json({error:'authentication_unavailable'});}
 };
}
