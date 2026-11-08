import {createClient,type SupabaseClient} from '@supabase/supabase-js';

/** Supabase's publishable key is designed for browser use with RLS. */
export function createAuthClient(url:string|undefined,key:string|undefined):SupabaseClient|null {
 if(!url?.trim()||!key?.trim())return null;
 let parsed:URL;
 try{parsed=new URL(url);}catch{return null;}
 if(parsed.protocol!=='https:'&&parsed.hostname!=='localhost'&&parsed.hostname!=='127.0.0.1')return null;
 return createClient(parsed.origin,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,flowType:'pkce'}});
}
let sharedClient:SupabaseClient|null|undefined;
export function getAuthClient():SupabaseClient|null {
 if(sharedClient===undefined){const env=(import.meta as ImportMeta & {env?:Record<string,string|undefined>}).env;sharedClient=createAuthClient(env?.VITE_SUPABASE_URL,env?.VITE_SUPABASE_PUBLISHABLE_KEY);}
 return sharedClient;
}

/** These methods do not yet enable account mode: the study API remains local-only. */
export function authActions(client:SupabaseClient,redirectTo:string){
 return {
  signUp:(email:string,password:string)=>client.auth.signUp({email,password,options:{emailRedirectTo:redirectTo}}),
  signIn:(email:string,password:string)=>client.auth.signInWithPassword({email,password}),
  resetPassword:(email:string)=>client.auth.resetPasswordForEmail(email,{redirectTo}),
  updatePassword:(password:string)=>client.auth.updateUser({password}),
  signOut:()=>client.auth.signOut(),
  getSession:()=>client.auth.getSession()
 };
}
