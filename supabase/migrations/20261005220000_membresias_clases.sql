-- S3-T06 — Membresías (M1) y Clases (M3)
-- Diseño: documentacion/Diseno_BD_S3-T06_Membresias_Clases.md
-- Requiere la Fase A existente: sedes, perfiles, membresias y sus enums.

-- ============ M1: membresías ============

create table public.planes_membresia (
  plan public.plan_membresia primary key,
  duracion_meses int not null check (duracion_meses > 0),
  precio numeric(12, 2) not null check (precio >= 0),
  activo boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Precios de ejemplo: a definir por el equipo
insert into public.planes_membresia (plan, duracion_meses, precio) values
  ('mensual', 1, 25000),
  ('trimestral', 3, 67500),
  ('anual', 12, 240000);

alter table public.membresias
  add constraint membresias_plan_fk foreign key (plan) references public.planes_membresia (plan),
  add constraint membresias_vigencia_valida check (vigente_hasta >= vigente_desde);

-- D1: historial de membresías. La Fase A proponía UNIQUE(perfil_id).
alter table public.membresias drop constraint if exists membresias_perfil_id_key;

create unique index membresias_una_activa_por_perfil
  on public.membresias (perfil_id)
  where estado = 'activo';

-- ============ M3: clases ============

create type public.estado_clase as enum ('programada', 'cancelada');
create type public.estado_inscripcion as enum ('inscripto', 'cancelada');
create type public.estado_espera as enum ('esperando', 'notificado', 'inscripto', 'retirado', 'vencido');

create table public.clases (
  id uuid primary key default gen_random_uuid(),
  sede_id uuid not null references public.sedes (id),
  tipo text not null,
  instructor text not null,
  inicio timestamptz not null,
  fin timestamptz not null,
  capacidad_max int not null check (capacidad_max > 0),
  estado public.estado_clase not null default 'programada',
  created_at timestamptz not null default now(),
  constraint clases_horario_valido check (fin > inicio)
);

create index clases_sede_inicio on public.clases (sede_id, inicio);

create table public.inscripciones_clase (
  id uuid primary key default gen_random_uuid(),
  clase_id uuid not null references public.clases (id) on delete cascade,
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  estado public.estado_inscripcion not null default 'inscripto',
  created_at timestamptz not null default now(),
  cancelada_en timestamptz,
  -- D6: cancelación con menos de 2 h. La penalidad se define más adelante.
  cancelacion_tardia boolean not null default false
);

create unique index inscripciones_una_vigente
  on public.inscripciones_clase (clase_id, perfil_id)
  where estado = 'inscripto';

create table public.lista_espera (
  id uuid primary key default gen_random_uuid(),
  clase_id uuid not null references public.clases (id) on delete cascade,
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  estado public.estado_espera not null default 'esperando',
  created_at timestamptz not null default now(),
  notificado_en timestamptz,
  -- D7: plazo para confirmar el lugar reservado
  vence_en timestamptz,
  constraint lista_espera_notificado_con_plazo
    check (estado <> 'notificado' or (notificado_en is not null and vence_en is not null))
);

create unique index lista_espera_una_vigente
  on public.lista_espera (clase_id, perfil_id)
  where estado in ('esperando', 'notificado');

create index lista_espera_orden on public.lista_espera (clase_id, created_at)
  where estado = 'esperando';

-- Un lugar está ocupado por una inscripción vigente o por un notificado
-- de la lista de espera cuyo plazo todavía no venció (D7).
create view public.clases_con_cupo
with (security_invoker = true) as
select
  c.*,
  c.capacidad_max
    - (select count(*) from public.inscripciones_clase i
       where i.clase_id = c.id and i.estado = 'inscripto')
    - (select count(*) from public.lista_espera e
       where e.clase_id = c.id and e.estado = 'notificado' and e.vence_en > now())
    as cupos_libres,
  (select count(*) from public.lista_espera e
   where e.clase_id = c.id and e.estado = 'esperando') as en_espera
from public.clases c;

-- ============ Funciones de cupo ============
-- Todas bloquean primero la fila de la clase (FOR UPDATE): las operaciones
-- sobre una misma clase se ejecutan de a una y no hay sobreventa.

create or replace function public.lugares_ocupados(p_clase_id uuid)
returns int
language sql
stable
set search_path = public
as $$
  select (
    (select count(*) from inscripciones_clase
     where clase_id = p_clase_id and estado = 'inscripto')
    +
    (select count(*) from lista_espera
     where clase_id = p_clase_id and estado = 'notificado' and vence_en > now())
  )::int;
$$;

-- Marca como vencidos a los notificados que no confirmaron a tiempo y notifica
-- a los siguientes mientras haya lugares libres. Devuelve los recién notificados
-- para que Nest les avise (Observer).
create or replace function public.procesar_lista_espera(p_clase_id uuid, p_plazo interval)
returns setof public.lista_espera
language plpgsql
set search_path = public
as $$
declare
  v_clase clases;
  v_siguiente lista_espera;
begin
  select * into v_clase from clases where id = p_clase_id for update;
  if not found then
    raise exception 'CLASE_NO_EXISTE';
  end if;

  update lista_espera
  set estado = 'vencido'
  where clase_id = p_clase_id and estado = 'notificado' and vence_en <= now();

  if v_clase.estado <> 'programada' or v_clase.inicio <= now() then
    return;
  end if;

  while lugares_ocupados(p_clase_id) < v_clase.capacidad_max loop
    update lista_espera
    set estado = 'notificado',
        notificado_en = now(),
        vence_en = least(now() + p_plazo, v_clase.inicio)
    where id = (
      select id from lista_espera
      where clase_id = p_clase_id and estado = 'esperando'
      order by created_at
      limit 1
    )
    returning * into v_siguiente;

    exit when not found;
    return next v_siguiente;
  end loop;
end;
$$;

-- Reserva directa de un lugar. Si hay gente en lista de espera, nadie se
-- adelanta: hay que anotarse en la lista.
create or replace function public.inscribir_en_clase(p_clase_id uuid, p_perfil_id uuid)
returns public.inscripciones_clase
language plpgsql
set search_path = public
as $$
declare
  v_clase clases;
  v_inscripcion inscripciones_clase;
begin
  select * into v_clase from clases where id = p_clase_id for update;

  if not found then
    raise exception 'CLASE_NO_EXISTE';
  end if;
  if v_clase.estado <> 'programada' then
    raise exception 'CLASE_CANCELADA';
  end if;
  if exists (select 1 from lista_espera where clase_id = p_clase_id and estado = 'esperando') then
    raise exception 'HAY_LISTA_DE_ESPERA';
  end if;
  if lugares_ocupados(p_clase_id) >= v_clase.capacidad_max then
    raise exception 'CLASE_LLENA';
  end if;

  insert into inscripciones_clase (clase_id, perfil_id)
  values (p_clase_id, p_perfil_id)
  returning * into v_inscripcion;

  return v_inscripcion;
end;
$$;

-- Cancela una inscripción y notifica al siguiente de la lista si se liberó lugar.
-- p_cancelacion_tardia la calcula Nest (menos de 2 h para el inicio, D6).
create or replace function public.cancelar_inscripcion(
  p_inscripcion_id uuid,
  p_cancelacion_tardia boolean,
  p_plazo interval
)
returns setof public.lista_espera
language plpgsql
set search_path = public
as $$
declare
  v_clase_id uuid;
begin
  select clase_id into v_clase_id from inscripciones_clase where id = p_inscripcion_id;
  if not found then
    raise exception 'INSCRIPCION_NO_EXISTE';
  end if;

  perform 1 from clases where id = v_clase_id for update;

  update inscripciones_clase
  set estado = 'cancelada', cancelada_en = now(), cancelacion_tardia = p_cancelacion_tardia
  where id = p_inscripcion_id and estado = 'inscripto';

  if not found then
    raise exception 'INSCRIPCION_NO_VIGENTE';
  end if;

  return query select * from procesar_lista_espera(v_clase_id, p_plazo);
end;
$$;

-- El notificado confirma el lugar que se le reservó.
create or replace function public.confirmar_lugar_espera(p_espera_id uuid)
returns public.inscripciones_clase
language plpgsql
set search_path = public
as $$
declare
  v_espera lista_espera;
  v_inscripcion inscripciones_clase;
begin
  select * into v_espera from lista_espera where id = p_espera_id;
  if not found then
    raise exception 'ESPERA_NO_EXISTE';
  end if;

  perform 1 from clases where id = v_espera.clase_id for update;

  select * into v_espera from lista_espera where id = p_espera_id;
  if v_espera.estado <> 'notificado' then
    raise exception 'ESPERA_NO_NOTIFICADA';
  end if;
  if v_espera.vence_en <= now() then
    raise exception 'PLAZO_VENCIDO';
  end if;

  update lista_espera set estado = 'inscripto' where id = p_espera_id;

  insert into inscripciones_clase (clase_id, perfil_id)
  values (v_espera.clase_id, v_espera.perfil_id)
  returning * into v_inscripcion;

  return v_inscripcion;
end;
$$;

-- Solo el backend (service_role) ejecuta estas funciones.
revoke execute on function public.lugares_ocupados(uuid) from public, anon, authenticated;
revoke execute on function public.procesar_lista_espera(uuid, interval) from public, anon, authenticated;
revoke execute on function public.inscribir_en_clase(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.cancelar_inscripcion(uuid, boolean, interval) from public, anon, authenticated;
revoke execute on function public.confirmar_lugar_espera(uuid) from public, anon, authenticated;

grant execute on function public.lugares_ocupados(uuid) to service_role;
grant execute on function public.procesar_lista_espera(uuid, interval) to service_role;
grant execute on function public.inscribir_en_clase(uuid, uuid) to service_role;
grant execute on function public.cancelar_inscripcion(uuid, boolean, interval) to service_role;
grant execute on function public.confirmar_lugar_espera(uuid) to service_role;

-- ============ D8: RLS (solo el backend accede) ============
-- Sin políticas: anon y authenticated no ven nada. service_role saltea RLS.

alter table public.sedes enable row level security;
alter table public.perfiles enable row level security;
alter table public.planes_membresia enable row level security;
alter table public.membresias enable row level security;
alter table public.clases enable row level security;
alter table public.inscripciones_clase enable row level security;
alter table public.lista_espera enable row level security;
