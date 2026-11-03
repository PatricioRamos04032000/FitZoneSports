-- S5-T01 — Fase A: núcleo (sedes, perfiles, membresías)
-- Baseline ya aplicado en el proyecto Supabase del equipo.
-- Sirve para recrear un Postgres vacío antes de 20261005220000 y 20261006190000.
-- Diseño: documentacion/Diseno_BD_S3-T06_Membresias_Clases.md §2 · Propuesta_ER Fase A
--
-- No incluye auth.users ni roles anon/authenticated/service_role (los crea Supabase).
-- membresias nace con UNIQUE(perfil_id); 20261005220000 lo reemplaza por el índice parcial.

create table public.sedes (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  aforo_max int not null default 50,
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create type public.rol_usuario as enum (
  'socio',
  'externo',
  'recepcionista',
  'gerente'
);

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
