-- Preparation only: the existing SQLite application is not yet connected to this schema.
-- Apply in a fresh Supabase project after reviewing the deployment guide.
create table public.dl_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  locale text not null default 'es' check (locale in ('es','en')),
  theme text not null default 'light' check (theme in ('light','dark')),
  daily_goal integer not null default 15 check (daily_goal in (5,10,15,20,30)),
  updated_at timestamptz not null default now()
);

create table public.dl_sessions (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  kind text not null check (kind in ('lesson','review','intensive','exam','errors','activity')),
  ref text, mode text not null check (mode in ('practice','exam')),
  focus text not null, started_at timestamptz not null,
  deadline timestamptz not null, finished_at timestamptz,
  state jsonb not null default '{}'::jsonb check (jsonb_typeof(state) = 'object' and pg_column_size(state) < 524288),
  result jsonb check (result is null or (jsonb_typeof(result) = 'object' and pg_column_size(result) < 524288)),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id,id)
);

create table public.dl_attempts (
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null, exercise_id text not null, lesson_id text not null,
  topic text not null, skill text not null, answer text not null check (char_length(answer) <= 6000),
  correct boolean, feedback jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  primary key (user_id,session_id,exercise_id),
  foreign key (user_id,session_id) references public.dl_sessions(user_id,id) on delete cascade
);

create table public.dl_saved_words (
  user_id uuid not null references auth.users(id) on delete cascade,
  word_id text not null check (char_length(word_id) <= 200), source_sentence text not null default '' check (char_length(source_sentence) <= 1500),
  saved_at timestamptz not null default now(), primary key (user_id,word_id)
);
create table public.dl_flashcards (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null check (char_length(card_id) <= 200),
  repetitions integer not null default 0 check (repetitions >= 0),
  interval_days integer not null default 0 check (interval_days >= 0),
  ease real not null default 2.5 check (ease >= 1.3), lapses integer not null default 0 check (lapses >= 0),
  due_at timestamptz not null, mastered boolean not null default false,
  updated_at timestamptz not null default now(), primary key (user_id,card_id)
);
create table public.dl_flashcard_reviews (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null, card_id text not null,
  rating text not null check (rating in ('again','hard','good','easy')),
  created_at timestamptz not null default now(), primary key (user_id,id)
);
create table public.dl_flashcard_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  new_limit integer not null default 10 check (new_limit between 0 and 100),
  review_limit integer not null default 30 check (review_limit between 0 and 200)
);
create table public.dl_recordings (
  user_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null, session_id uuid not null, exercise_id text not null,
  object_path text not null check (char_length(object_path) <= 512),
  mime text not null check (mime in ('audio/webm','audio/ogg','audio/mp4')),
  transcript text, created_at timestamptz not null default now(),
  primary key (user_id,id),
  foreign key (user_id,session_id) references public.dl_sessions(user_id,id) on delete cascade,
  check (split_part(object_path,'/',1) = user_id::text)
);

-- No anonymous access. All foreign keys to session data include user_id.
do $$
declare t text;
begin
  foreach t in array array['dl_profiles','dl_sessions','dl_attempts','dl_saved_words','dl_flashcards','dl_flashcard_reviews','dl_flashcard_settings','dl_recordings'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on public.%I from anon, authenticated',t);
    execute format('grant select, insert, update, delete on public.%I to authenticated',t);
    execute format('create policy owner_only on public.%I for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)',t);
  end loop;
end $$;
create index dl_attempts_by_topic on public.dl_attempts(user_id,topic,created_at desc);
create index dl_flashcards_by_due on public.dl_flashcards(user_id,due_at);
create index dl_reviews_by_day on public.dl_flashcard_reviews(user_id,created_at desc);

-- Private microphone recordings; no public bucket or anonymous object policies.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('deutsch-lernen-recordings','deutsch-lernen-recordings',false,8388608,array['audio/webm','audio/ogg','audio/mp4'])
on conflict (id) do nothing;
create policy dl_recordings_read on storage.objects for select to authenticated
  using (bucket_id = 'deutsch-lernen-recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy dl_recordings_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'deutsch-lernen-recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy dl_recordings_delete on storage.objects for delete to authenticated
  using (bucket_id = 'deutsch-lernen-recordings' and (storage.foldername(name))[1] = (select auth.uid()::text));
