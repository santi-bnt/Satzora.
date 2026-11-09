-- Additive, owner-private storage for entries saved from the Wiktionary fallback.
-- This migration is intentionally not applied automatically.
create table if not exists public.dl_dictionary_cards (
  user_id uuid not null references auth.users(id) on delete cascade,
  card_id text not null check (char_length(card_id) <= 200),
  entry jsonb not null check (jsonb_typeof(entry) = 'object' and pg_column_size(entry) <= 32768),
  source_sentence text not null default '' check (char_length(source_sentence) <= 1500),
  saved_at timestamptz not null default now(),
  primary key (user_id, card_id)
);
alter table public.dl_dictionary_cards enable row level security;
revoke all on public.dl_dictionary_cards from public, anon, authenticated;
grant select, insert, update, delete on public.dl_dictionary_cards to authenticated;
create policy owner_only on public.dl_dictionary_cards
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
