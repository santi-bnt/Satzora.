-- Run as the project database administrator; set the password separately with
-- psql's \password satzora_keepalive so it is not embedded in this file.
-- PUBLIC privileges still apply to every PostgreSQL role; audit them before use.
create role satzora_keepalive login noinherit nosuperuser nocreatedb nocreaterole noreplication;
grant connect on database postgres to satzora_keepalive;
alter role satzora_keepalive set default_transaction_read_only = on;
alter role satzora_keepalive set statement_timeout = '5s';
alter role satzora_keepalive set search_path = pg_catalog;
