-- Preserve the submitted answers and official-answer evaluations while allowing
-- a user to add their own post-exam checklist and non-official assessments.
create function public.dl_update_finished_session_state(
 p_session_id uuid, p_expected_revision bigint, p_state jsonb
) returns boolean language plpgsql security definer set search_path='' as $$
declare changed integer;
begin
 if (select auth.uid()) is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_session_id is null or p_expected_revision is null or p_expected_revision<0
    or p_state is null or jsonb_typeof(p_state)<>'object' or pg_column_size(p_state)>=524288 then
  raise exception 'invalid session state' using errcode='22023';
 end if;
 update public.dl_sessions set state=p_state,revision=revision+1,updated_at=now()
 where user_id=(select auth.uid()) and id=p_session_id and revision=p_expected_revision
   and finished_at is not null
   and (state - array['selfChecks','assessments','coach'])=(p_state - array['selfChecks','assessments','coach']);
 get diagnostics changed=row_count;
 return changed=1;
end $$;
revoke all on function public.dl_update_finished_session_state(uuid,bigint,jsonb) from public,anon;
grant execute on function public.dl_update_finished_session_state(uuid,bigint,jsonb) to authenticated;
