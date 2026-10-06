-- SOLO para un PostgreSQL local de prueba. NO ejecutar en Supabase.
-- Simula lo que Supabase ya tiene: roles, auth.users y la Fase A.
--
-- Uso (base vacía):
--   psql -d fz_test -v ON_ERROR_STOP=1 -f supabase/tests/00_fase_a_simulada.sql
--   psql -d fz_test -v ON_ERROR_STOP=1 -1 -f supabase/migrations/20261005220000_membresias_clases.sql
--   psql -d fz_test -f supabase/tests/membresias_clases.test.sql
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text);

create table public.sedes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  aforo_max int not null default 50,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.rol_usuario as enum ('socio', 'externo', 'recepcionista', 'gerente');

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  rol public.rol_usuario not null,
  dni text not null unique,
  nombre text not null,
  apellido text,
  telefono text,
  foto_url text,
  sede_home_id uuid references public.sedes (id),
  created_at timestamptz not null default now()
);

create type public.plan_membresia as enum ('mensual', 'trimestral', 'anual');
create type public.estado_membresia as enum ('activo', 'vencido', 'suspendido');

create table public.membresias (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null unique references public.perfiles (id) on delete cascade,
  plan public.plan_membresia not null,
  estado public.estado_membresia not null default 'activo',
  vigente_desde date not null,
  vigente_hasta date not null,
  created_at timestamptz not null default now()
);

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
