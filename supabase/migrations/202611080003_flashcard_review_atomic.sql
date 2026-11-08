-- A review is an idempotent event and a state change in the same transaction.
-- The caller passes its observed version; a stale write is rejected.
create or replace function public.dl_record_flashcard_review(
 p_event_id uuid, p_card_id text, p_rating text, p_expected_updated_at timestamptz,
 p_repetitions integer, p_interval_days integer, p_ease real, p_lapses integer,
 p_due_at timestamptz, p_mastered boolean
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid(); current_row public.dl_flashcards%rowtype; old_event public.dl_flashcard_reviews%rowtype;
begin
 if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_event_id is null or p_card_id is null or length(p_card_id)=0 or length(p_card_id)>200
   or p_rating is null or p_rating not in ('again','hard','good','easy') or p_repetitions is null or p_repetitions<0
   or p_interval_days is null or p_interval_days<0 or p_ease is null or p_ease<1.3
   or p_lapses is null or p_lapses<0 or p_due_at is null or p_mastered is null then
   raise exception 'invalid review' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_card_id,0));
 select * into old_event from public.dl_flashcard_reviews where user_id=uid and id=p_event_id;
 if found then
   if old_event.card_id<>p_card_id or old_event.rating<>p_rating then raise exception 'event conflict' using errcode='22023'; end if;
   select * into current_row from public.dl_flashcards where user_id=uid and card_id=p_card_id;
   return jsonb_build_object('status','duplicate','state',to_jsonb(current_row));
 end if;
 select * into current_row from public.dl_flashcards where user_id=uid and card_id=p_card_id;
 if (found and current_row.updated_at is distinct from p_expected_updated_at) or (not found and p_expected_updated_at is not null) then
   return jsonb_build_object('status','conflict');
 end if;
 insert into public.dl_flashcards(user_id,card_id,repetitions,interval_days,ease,lapses,due_at,mastered,updated_at)
 values(uid,p_card_id,p_repetitions,p_interval_days,p_ease,p_lapses,p_due_at,p_mastered,clock_timestamp())
 on conflict(user_id,card_id) do update set repetitions=excluded.repetitions,interval_days=excluded.interval_days,ease=excluded.ease,lapses=excluded.lapses,due_at=excluded.due_at,mastered=excluded.mastered,updated_at=excluded.updated_at
 returning * into current_row;
 insert into public.dl_flashcard_reviews(user_id,id,card_id,rating) values(uid,p_event_id,p_card_id,p_rating);
 return jsonb_build_object('status','saved','state',to_jsonb(current_row));
end $$;
revoke all on function public.dl_record_flashcard_review(uuid,text,text,timestamptz,integer,integer,real,integer,timestamptz,boolean) from public, anon;
grant execute on function public.dl_record_flashcard_review(uuid,text,text,timestamptz,integer,integer,real,integer,timestamptz,boolean) to authenticated;
