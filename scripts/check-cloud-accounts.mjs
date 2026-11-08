import {createClient} from '@supabase/supabase-js';
import {resolve} from 'node:path';
process.loadEnvFile(resolve('..','.env.local'));
const {VITE_SUPABASE_URL:url,VITE_SUPABASE_PUBLISHABLE_KEY:key}=process.env;
for(const name of ['A','B']){
 const client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 try {
  const {data,error}=await client.auth.signInWithPassword({email:process.env[`SATZORA_TEST_${name}_EMAIL`],password:process.env[`SATZORA_TEST_${name}_PASSWORD`]});
  if(error||!data.user) {console.log(`Usuario ${name}: inicio de sesión fallido (${error?.status||'error'}).`);process.exitCode=1;continue;}
  const result=await client.from('dl_flashcards').select('card_id',{count:'exact',head:true});
  if(result.error){console.log(`Usuario ${name}: acceso a flashcards fallido (${result.error.code||'error'}).`);process.exitCode=1;}
  else console.log(`Usuario ${name}: sesión y lectura autenticada correctas; ${result.count} flashcards visibles.`);
  await client.auth.signOut();
 }catch {console.log(`Usuario ${name}: no se pudo conectar con Supabase.`);process.exitCode=1;}
}
