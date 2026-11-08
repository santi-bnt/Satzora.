-- Session writes use an expected server revision, never the client clock.
-- A false result means the caller must fetch the current row and resolve the conflict.
revoke update, delete on public.dl_sessions from authenticated;

create function public.dl_save_session_state(
  p_session_id uuid,
  p_expected_revision bigint,
  p_state jsonb,
  p_finished_at timestamptz default null,
  p_result jsonb default null
) returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  if (select auth.uid()) is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if p_session_id is null or p_expected_revision is null or p_expected_revision < 0
     or p_state is null or jsonb_typeof(p_state) <> 'object'
     or pg_column_size(p_state) >= 524288
     or (p_result is not null and (jsonb_typeof(p_result) <> 'object' or pg_column_size(p_result) >= 524288))
     or ((p_finished_at is null) <> (p_result is null)) then
    raise exception 'invalid session state' using errcode = '22023';
  end if;
  update public.dl_sessions
     set state = p_state, finished_at = p_finished_at, result = p_result,
         revision = revision + 1, updated_at = now()
   where user_id = (select auth.uid()) and id = p_session_id
     and revision = p_expected_revision and finished_at is null;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;
revoke all on function public.dl_save_session_state(uuid,bigint,jsonb,timestamptz,jsonb) from public, anon;
grant execute on function public.dl_save_session_state(uuid,bigint,jsonb,timestamptz,jsonb) to authenticated;
