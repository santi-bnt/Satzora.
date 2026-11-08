-- Additive active-recall tracking; existing flashcard states and review history remain intact.
create table if not exists public.dl_flashcard_mode_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null check (char_length(card_id) between 1 and 200),
  mode text not null check (mode in ('classic','reverse','cloze','sentence')),
  attempts integer not null default 0 check (attempts >= 0),
  correct integer not null default 0 check (correct >= 0 and correct <= attempts),
  lapses integer not null default 0 check (lapses >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, card_id, mode)
);
create table if not exists public.dl_flashcard_mode_reviews (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  card_id text not null check (char_length(card_id) between 1 and 200),
  mode text not null check (mode in ('classic','reverse','cloze','sentence')),
  correct boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);
create index if not exists dl_flashcard_mode_reviews_user_date on public.dl_flashcard_mode_reviews(user_id, created_at desc);
alter table public.dl_flashcard_mode_progress enable row level security;
alter table public.dl_flashcard_mode_reviews enable row level security;
create policy dl_flashcard_mode_progress_owner on public.dl_flashcard_mode_progress for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy dl_flashcard_mode_reviews_owner on public.dl_flashcard_mode_reviews for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
revoke all on public.dl_flashcard_mode_progress, public.dl_flashcard_mode_reviews from anon, public;
grant select, insert, update, delete on public.dl_flashcard_mode_progress, public.dl_flashcard_mode_reviews to authenticated;

create or replace function public.dl_record_flashcard_mode_review(
 p_event_id uuid, p_card_id text, p_mode text, p_correct boolean,
 p_rating text, p_expected_updated_at timestamptz, p_repetitions integer,
 p_interval_days integer, p_ease real, p_lapses integer, p_due_at timestamptz,
 p_mastered boolean
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare uid uuid := auth.uid(); outcome jsonb; existing public.dl_flashcard_mode_reviews%rowtype;
begin
 if uid is null then raise exception 'authentication required' using errcode='42501'; end if;
 if p_mode is null or p_mode not in ('classic','reverse','cloze','sentence') or p_correct is null then
   raise exception 'invalid mode review' using errcode='22023';
 end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text || ':' || p_card_id || ':' || p_mode,0));
 select * into existing from public.dl_flashcard_mode_reviews where user_id=uid and id=p_event_id;
 if found then
   if existing.card_id<>p_card_id or existing.mode<>p_mode or existing.correct<>p_correct then
     raise exception 'event conflict' using errcode='22023';
   end if;
   return jsonb_build_object('status','duplicate');
 end if;
 outcome := public.dl_record_flashcard_review(p_event_id,p_card_id,p_rating,p_expected_updated_at,
   p_repetitions,p_interval_days,p_ease,p_lapses,p_due_at,p_mastered);
 if outcome->>'status' in ('saved','duplicate') then
   insert into public.dl_flashcard_mode_reviews(user_id,id,card_id,mode,correct)
   values(uid,p_event_id,p_card_id,p_mode,p_correct);
   insert into public.dl_flashcard_mode_progress(user_id,card_id,mode,attempts,correct,lapses,updated_at)
   values(uid,p_card_id,p_mode,1,case when p_correct then 1 else 0 end,case when p_correct then 0 else 1 end,clock_timestamp())
   on conflict(user_id,card_id,mode) do update set
     attempts=public.dl_flashcard_mode_progress.attempts+1,
     correct=public.dl_flashcard_mode_progress.correct+case when p_correct then 1 else 0 end,
     lapses=public.dl_flashcard_mode_progress.lapses+case when p_correct then 0 else 1 end,
     updated_at=clock_timestamp();
 end if;
 return outcome;
end $$;
revoke all on function public.dl_record_flashcard_mode_review(uuid,text,text,boolean,text,timestamptz,integer,integer,real,integer,timestamptz,boolean) from public, anon;
grant execute on function public.dl_record_flashcard_mode_review(uuid,text,text,boolean,text,timestamptz,integer,integer,real,integer,timestamptz,boolean) to authenticated;
