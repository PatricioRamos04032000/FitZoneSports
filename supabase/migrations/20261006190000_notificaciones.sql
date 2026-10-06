-- S4-T02 — Notificaciones in-app (Observer de lista de espera, RF-08)
-- Diseño: documentacion/Diseno_Observer_S4-T02_Notificaciones.md
-- Requiere la migración 20261005220000_membresias_clases.sql.

-- Preferencia del socio: además de in-app, recibir el aviso por email (simulado).
alter table public.perfiles
  add column notificar_por_email boolean not null default false;

create type public.tipo_notificacion as enum ('lugar_liberado');

create table public.notificaciones (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  tipo public.tipo_notificacion not null,
  titulo text not null,
  mensaje text not null,
  -- Ids para que el front arme la acción (p. ej. confirmar el lugar).
  datos jsonb not null default '{}',
  leida_en timestamptz,
  created_at timestamptz not null default now()
);

create index notificaciones_perfil_fecha on public.notificaciones (perfil_id, created_at desc);

-- D8: solo el backend accede.
alter table public.notificaciones enable row level security;
