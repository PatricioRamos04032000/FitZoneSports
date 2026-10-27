-- S5-T02 — Migración M4: canchas, reservas, config pico/cadena, admins_sede
-- Diseño: documentacion/Propuesta_Reglas_Negocio_S4-T09.md
--         documentacion/Propuesta_Continuacion_Semanas.md §4 (Migración M4)
-- Requiere: 20260915000000 (Fase A) + 20261005220000 + 20261006190000.

-- ============ Rol A3: recepcionista → admin_sede ============

alter type public.rol_usuario rename value 'recepcionista' to 'admin_sede';

-- ============ Configuración de precios (S4-T09 P3 / P8) ============

create table public.configuracion_pico (
  sede_id uuid primary key references public.sedes (id) on delete cascade,
  recargo_pct numeric(5, 2) not null default 20
    check (recargo_pct between 0 and 100),
  desde time not null default '19:00',
  hasta time not null default '21:00',
  dias smallint[] not null default '{1,2,3,4,5,6,7}',
  updated_at timestamptz not null default now(),
  constraint configuracion_pico_horario check (desde < hasta)
);

-- Defaults RF-11 para sedes ya existentes y para las nuevas.
insert into public.configuracion_pico (sede_id)
select id from public.sedes
on conflict do nothing;

create or replace function public.sedes_crear_configuracion_pico()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  insert into configuracion_pico (sede_id) values (new.id)
  on conflict do nothing;
  return new;
end;
$$;

create trigger sedes_after_insert_configuracion_pico
  after insert on public.sedes
  for each row
  execute function public.sedes_crear_configuracion_pico();

create table public.configuracion_cadena (
  id boolean primary key default true check (id),
  descuento_socio_pct numeric(5, 2) not null default 15
    check (descuento_socio_pct between 0 and 100),
  updated_at timestamptz not null default now()
);

insert into public.configuracion_cadena default values;

-- ============ Admins de sede (A3 multi-sede) ============

create table public.admins_sede (
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  sede_id uuid not null references public.sedes (id) on delete cascade,
  primary key (perfil_id, sede_id)
);

-- ============ Canchas y mantenimiento por períodos ============

create type public.tipo_cancha as enum ('paddle', 'futbol5', 'otro');

create table public.canchas (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references public.sedes (id) on delete cascade,
  tipo public.tipo_cancha not null,
  nombre text not null,
  precio_hora numeric(12, 2) not null check (precio_hora >= 0),
  activa boolean not null default true,
  created_at timestamptz not null default now()
);

create index canchas_sede on public.canchas (sede_id);

create table public.mantenimientos_cancha (
  id uuid primary key default gen_random_uuid(),
  cancha_id uuid not null references public.canchas (id) on delete cascade,
  desde timestamptz not null,
  hasta timestamptz not null,
  motivo text,
  created_at timestamptz not null default now(),
  constraint mantenimientos_cancha_periodo check (hasta > desde)
);

create index mantenimientos_cancha_rango
  on public.mantenimientos_cancha (cancha_id, desde, hasta);

-- ============ Reservas (RN-02) ============

create type public.estado_reserva_cancha as enum ('pendiente', 'confirmada', 'cancelada');

create table public.reservas_cancha (
  id uuid primary key default gen_random_uuid(),
  cancha_id uuid not null references public.canchas (id) on delete restrict,
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  inicio timestamptz not null,
  fin timestamptz not null,
  precio numeric(12, 2) not null check (precio >= 0),
  -- P6: base + reglas aplicadas al momento de reservar (p. ej. pico, descuento).
  detalle jsonb not null default '{}',
  estado public.estado_reserva_cancha not null default 'confirmada',
  created_at timestamptz not null default now(),
  constraint reservas_cancha_horario check (fin > inicio)
);

-- RN-02: un turno ocupado no se vuelve a vender (pendiente o confirmada).
create unique index reservas_cancha_sin_sobreventa
  on public.reservas_cancha (cancha_id, inicio)
  where estado in ('pendiente', 'confirmada');

create index reservas_cancha_perfil on public.reservas_cancha (perfil_id, inicio);
create index reservas_cancha_cancha_inicio on public.reservas_cancha (cancha_id, inicio);

-- Reserva atómica: bloquea la cancha, valida turno / mantenimiento / horizonte
-- e inserta. Nest calcula el precio (Strategy) y lo pasa; no hace read-then-write.
create or replace function public.reservar_cancha(
  p_cancha_id uuid,
  p_perfil_id uuid,
  p_inicio timestamptz,
  p_precio numeric,
  p_detalle jsonb default '{}',
  p_estado public.estado_reserva_cancha default 'confirmada'
)
returns public.reservas_cancha
language plpgsql
set search_path = public
as $$
declare
  v_cancha canchas;
  v_fin timestamptz;
  v_reserva reservas_cancha;
begin
  if p_estado not in ('pendiente', 'confirmada') then
    raise exception 'ESTADO_INVALIDO';
  end if;

  select * into v_cancha from canchas where id = p_cancha_id for update;
  if not found then
    raise exception 'CANCHA_NO_EXISTE';
  end if;
  if not v_cancha.activa then
    raise exception 'CANCHA_INACTIVA';
  end if;

  -- P2: turnos de 60 min en hora en punto.
  if date_trunc('hour', p_inicio) <> p_inicio then
    raise exception 'TURNO_NO_EN_HORA';
  end if;
  if p_inicio <= now() then
    raise exception 'TURNO_PASADO';
  end if;

  -- P6: hasta 1 mes calendario hacia adelante (misma fecha del mes siguiente).
  if p_inicio > (now() + interval '1 month') then
    raise exception 'FUERA_DE_HORIZONTE';
  end if;

  v_fin := p_inicio + interval '1 hour';

  if exists (
    select 1 from mantenimientos_cancha m
    where m.cancha_id = p_cancha_id
      and m.desde < v_fin
      and m.hasta > p_inicio
  ) then
    raise exception 'CANCHA_EN_MANTENIMIENTO';
  end if;

  if not exists (select 1 from perfiles where id = p_perfil_id) then
    raise exception 'PERFIL_NO_EXISTE';
  end if;

  insert into reservas_cancha (
    cancha_id, perfil_id, inicio, fin, precio, detalle, estado
  ) values (
    p_cancha_id, p_perfil_id, p_inicio, v_fin, p_precio,
    coalesce(p_detalle, '{}'::jsonb), p_estado
  )
  returning * into v_reserva;

  return v_reserva;
exception
  when unique_violation then
    raise exception 'TURNO_OCUPADO';
end;
$$;

create or replace function public.cancelar_reserva_cancha(p_reserva_id uuid)
returns public.reservas_cancha
language plpgsql
set search_path = public
as $$
declare
  v_reserva reservas_cancha;
begin
  select * into v_reserva from reservas_cancha where id = p_reserva_id for update;
  if not found then
    raise exception 'RESERVA_NO_EXISTE';
  end if;
  if v_reserva.estado = 'cancelada' then
    raise exception 'RESERVA_YA_CANCELADA';
  end if;

  -- Bloquea la cancha para alinear con reservar_cancha.
  perform 1 from canchas where id = v_reserva.cancha_id for update;

  update reservas_cancha
  set estado = 'cancelada'
  where id = p_reserva_id
  returning * into v_reserva;

  return v_reserva;
end;
$$;

revoke execute on function public.reservar_cancha(uuid, uuid, timestamptz, numeric, jsonb, public.estado_reserva_cancha)
  from public, anon, authenticated;
revoke execute on function public.cancelar_reserva_cancha(uuid)
  from public, anon, authenticated;

grant execute on function public.reservar_cancha(uuid, uuid, timestamptz, numeric, jsonb, public.estado_reserva_cancha)
  to service_role;
grant execute on function public.cancelar_reserva_cancha(uuid)
  to service_role;

-- ============ RLS (solo el backend accede) ============

alter table public.configuracion_pico enable row level security;
alter table public.configuracion_cadena enable row level security;
alter table public.admins_sede enable row level security;
alter table public.canchas enable row level security;
alter table public.mantenimientos_cancha enable row level security;
alter table public.reservas_cancha enable row level security;
