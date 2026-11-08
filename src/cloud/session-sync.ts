import type {SupabaseClient} from '@supabase/supabase-js';

export type SessionSave={id:string;revision:number;state:Record<string,unknown>;finishedAt?:string|null;result?:Record<string,unknown>|null};
export type SaveResult={status:'saved';revision:number}|{status:'conflict'};

/** Never retries a conflict: callers must load both versions and ask how to resolve them. */
export async function saveSession(client:SupabaseClient,session:SessionSave):Promise<SaveResult>{
 if(!Number.isSafeInteger(session.revision)||session.revision<0)throw new Error('invalid_revision');
 if(Boolean(session.finishedAt)!==Boolean(session.result))throw new Error('invalid_completion');
 const {data,error}=await client.rpc('dl_save_session_state',{
  p_session_id:session.id,p_expected_revision:session.revision,p_state:session.state,
  p_finished_at:session.finishedAt??null,p_result:session.result??null
 });
 if(error)throw error;
 if(data===false)return {status:'conflict'};
 if(data!==true)throw new Error('invalid_server_response');
 return {status:'saved',revision:session.revision+1};
}
