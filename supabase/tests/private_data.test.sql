-- Run only in an isolated local Supabase test database with pgTAP installed.
begin;
create extension if not exists pgtap with schema extensions;
select plan(5);
insert into auth.users(id,aud,role,email,encrypted_password,created_at,updated_at)
values ('00000000-0000-4000-8000-000000000001','authenticated','authenticated','rls-a@example.invalid','',now(),now()),
       ('00000000-0000-4000-8000-000000000002','authenticated','authenticated','rls-b@example.invalid','',now(),now());
insert into public.dl_profiles(user_id,display_name)
values ('00000000-0000-4000-8000-000000000001','A'),('00000000-0000-4000-8000-000000000002','B');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
select is((select count(*)::integer from public.dl_profiles),1,'A can see only one profile');
select is((select display_name from public.dl_profiles limit 1),'A','A sees own data');
select is_empty($$update public.dl_profiles set display_name='changed' where user_id='00000000-0000-4000-8000-000000000002' returning user_id$$,'A cannot update B');
select throws_ok($$insert into public.dl_saved_words(user_id,word_id) values ('00000000-0000-4000-8000-000000000002','dict-termin')$$,'42501',null,'A cannot insert a word for B');
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
select is((select display_name from public.dl_profiles limit 1),'B','B sees own data, not A');
select * from finish();
rollback;
