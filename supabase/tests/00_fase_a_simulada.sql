-- SOLO para un PostgreSQL local de prueba. NO ejecutar en Supabase.
-- Arma roles y auth.users; el esquema de negocio está en la migración Fase A.
--
-- Uso (desde la raíz del repo, base vacía):
--   psql -d fz_test -v ON_ERROR_STOP=1 -f supabase/tests/00_fase_a_simulada.sql
--   psql -d fz_test -v ON_ERROR_STOP=1 -1 -f supabase/migrations/20260915000000_fase_a_nucleo.sql
--   psql -d fz_test -v ON_ERROR_STOP=1 -1 -f supabase/migrations/20261005220000_membresias_clases.sql
--   psql -d fz_test -v ON_ERROR_STOP=1 -1 -f supabase/migrations/20261006190000_notificaciones.sql
--   psql -d fz_test -v ON_ERROR_STOP=1 -1 -f supabase/migrations/20261027200000_canchas_m4.sql
--   psql -d fz_test -v ON_ERROR_STOP=1 -c "grant all on all tables in schema public to anon, authenticated, service_role; grant execute on all functions in schema public to service_role;"
--   psql -d fz_test -f supabase/tests/membresias_clases.test.sql
--   psql -d fz_test -f supabase/tests/canchas_m4.test.sql
-- Nota: USAGE de types ya lo dejan los default privileges del stub.
-- No re-otorgar EXECUTE de RPCs a anon/authenticated; las migraciones lo dejan solo en service_role.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema auth to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
alter default privileges in schema public grant usage on types to anon, authenticated, service_role;
