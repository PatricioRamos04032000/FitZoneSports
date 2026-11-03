-- S6-T03 — Migración M5: tabla pagos (token de pasarela, RNF-02)
-- Diseño: documentacion/Propuesta_ER_FitZone.md §4–5
--         documentacion/Propuesta_Continuacion_Semanas.md §5 (Esquema de pagos)
-- Requiere: 20260915000000 (Fase A) + 20261027200000 (M4 / reservas_cancha).
-- Sin pasarela Nest ni endpoints: el cobro mock llega en S7.

-- ============ Enums ============

create type public.concepto_pago as enum ('membresia', 'reserva_cancha');
create type public.estado_pago as enum ('pendiente', 'aprobado', 'rechazado');

-- ============ Pagos ============

create table public.pagos (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  concepto public.concepto_pago not null,
  monto numeric(12, 2) not null check (monto >= 0),
  -- RNF-02: solo token de pasarela; null mientras estado = pendiente.
  token_pasarela text,
  estado public.estado_pago not null default 'pendiente',
  reserva_cancha_id uuid references public.reservas_cancha (id) on delete restrict,
  membresia_id uuid references public.membresias (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint pagos_vinculo check (
    (
      concepto = 'membresia'
      and membresia_id is not null
      and reserva_cancha_id is null
    )
    or
    (
      concepto = 'reserva_cancha'
      and reserva_cancha_id is not null
      and membresia_id is null
    )
  )
);

create index pagos_perfil_fecha on public.pagos (perfil_id, created_at desc);
create index pagos_reserva_cancha on public.pagos (reserva_cancha_id);
create index pagos_membresia on public.pagos (membresia_id);

-- Solo el backend (service_role) accede.
alter table public.pagos enable row level security;
