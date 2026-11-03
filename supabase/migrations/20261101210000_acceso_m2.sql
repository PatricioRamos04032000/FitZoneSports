-- S8-T1 / M2 — Acceso: totp_seeds, presencias, check_ins + RPC check-in/out
-- Diseño: documentacion/Plan_M2_Acceso_QR_Patricio.md · ADR-007 · Propuesta_ER_FitZone.md
-- RN-01: UNIQUE/PK en presencias; Nest mapea unique_violation (como RN-02 / TURNO_OCUPADO).
-- Requiere: 20260915000000_fase_a_nucleo.sql (sedes, perfiles).
--
-- Fase 1: seed_cifrado guarda base32 en claro (demo). Cifrado AES en Nest = Fase 2.

-- ============ Enums ============

create type public.tipo_check_in as enum ('entrada', 'salida');
create type public.origen_check_in as enum ('online', 'offline_sync');

-- ============ TOTP seeds (RF-04) ============

create table public.totp_seeds (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null unique references public.perfiles (id) on delete cascade,
  -- Opaco al front. En Fase 1 el seed demo es base32 en claro; Nest cifrará en Fase 2.
  seed_cifrado text not null,
  activo boolean not null default true,
  rotado_en timestamptz,
  created_at timestamptz not null default now()
);

-- ============ Presencias (RN-01: a lo sumo una sede) ============

create table public.presencias (
  perfil_id uuid primary key references public.perfiles (id) on delete cascade,
  sede_id uuid not null references public.sedes (id) on delete restrict,
  desde timestamptz not null default now()
);

create index presencias_sede on public.presencias (sede_id);

-- ============ Check-ins (historial) ============

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  perfil_id uuid not null references public.perfiles (id) on delete cascade,
  sede_id uuid not null references public.sedes (id) on delete restrict,
  tipo public.tipo_check_in not null,
  origen public.origen_check_in not null default 'online',
  ocurrio_en timestamptz not null default now(),
  -- Idempotencia del sync offline (Fase 3); varios NULL permitidos.
  client_event_id uuid unique,
  created_at timestamptz not null default now()
);

create index check_ins_sede_fecha on public.check_ins (sede_id, ocurrio_en desc);
create index check_ins_perfil_fecha on public.check_ins (perfil_id, ocurrio_en desc);

-- ============ RPC: registrar_check_in (entrada + presencia) ============

create or replace function public.registrar_check_in(
  p_perfil_id uuid,
  p_sede_id uuid,
  p_origen public.origen_check_in default 'online',
  p_ocurrio_en timestamptz default now(),
  p_client_event_id uuid default null
)
returns public.check_ins
language plpgsql
set search_path = public
as $$
declare
  v_existente check_ins;
  v_sede_actual uuid;
  v_check check_ins;
begin
  if p_client_event_id is not null then
    select * into v_existente
    from check_ins
    where client_event_id = p_client_event_id;

    if found then
      return v_existente;
    end if;
  end if;

  if not exists (select 1 from perfiles where id = p_perfil_id) then
    raise exception 'PERFIL_NO_EXISTE';
  end if;

  if not exists (select 1 from sedes where id = p_sede_id) then
    raise exception 'SEDE_NO_EXISTE';
  end if;

  begin
    insert into presencias (perfil_id, sede_id, desde)
    values (p_perfil_id, p_sede_id, coalesce(p_ocurrio_en, now()));
  exception
    when unique_violation then
      select sede_id into v_sede_actual
      from presencias
      where perfil_id = p_perfil_id;

      if v_sede_actual = p_sede_id then
        raise exception 'YA_DENTRO';
      else
        raise exception 'YA_EN_OTRA_SEDE';
      end if;
  end;

  insert into check_ins (
    perfil_id, sede_id, tipo, origen, ocurrio_en, client_event_id
  ) values (
    p_perfil_id,
    p_sede_id,
    'entrada',
    coalesce(p_origen, 'online'),
    coalesce(p_ocurrio_en, now()),
    p_client_event_id
  )
  returning * into v_check;

  return v_check;
exception
  when unique_violation then
    -- Carrera en client_event_id tras insertar presencia: reintentar lectura idempotente.
    if p_client_event_id is not null then
      select * into v_existente
      from check_ins
      where client_event_id = p_client_event_id;
      if found then
        return v_existente;
      end if;
    end if;
    raise exception 'EVENTO_DUPLICADO';
end;
$$;

-- ============ RPC: registrar_check_out ============

create or replace function public.registrar_check_out(
  p_perfil_id uuid,
  p_sede_id uuid,
  p_origen public.origen_check_in default 'online',
  p_ocurrio_en timestamptz default now(),
  p_client_event_id uuid default null
)
returns public.check_ins
language plpgsql
set search_path = public
as $$
declare
  v_existente check_ins;
  v_presencia presencias;
  v_check check_ins;
begin
  if p_client_event_id is not null then
    select * into v_existente
    from check_ins
    where client_event_id = p_client_event_id;

    if found then
      return v_existente;
    end if;
  end if;

  select * into v_presencia
  from presencias
  where perfil_id = p_perfil_id
  for update;

  if not found then
    raise exception 'PRESENCIA_NO_EXISTE';
  end if;

  if v_presencia.sede_id <> p_sede_id then
    raise exception 'SEDE_DISTINTA';
  end if;

  delete from presencias where perfil_id = p_perfil_id;

  insert into check_ins (
    perfil_id, sede_id, tipo, origen, ocurrio_en, client_event_id
  ) values (
    p_perfil_id,
    p_sede_id,
    'salida',
    coalesce(p_origen, 'online'),
    coalesce(p_ocurrio_en, now()),
    p_client_event_id
  )
  returning * into v_check;

  return v_check;
exception
  when unique_violation then
    if p_client_event_id is not null then
      select * into v_existente
      from check_ins
      where client_event_id = p_client_event_id;
      if found then
        return v_existente;
      end if;
    end if;
    raise exception 'EVENTO_DUPLICADO';
end;
$$;

revoke execute on function public.registrar_check_in(uuid, uuid, public.origen_check_in, timestamptz, uuid)
  from public, anon, authenticated;
revoke execute on function public.registrar_check_out(uuid, uuid, public.origen_check_in, timestamptz, uuid)
  from public, anon, authenticated;

grant execute on function public.registrar_check_in(uuid, uuid, public.origen_check_in, timestamptz, uuid)
  to service_role;
grant execute on function public.registrar_check_out(uuid, uuid, public.origen_check_in, timestamptz, uuid)
  to service_role;

-- ============ RLS (solo el backend / service_role) ============

alter table public.totp_seeds enable row level security;
alter table public.presencias enable row level security;
alter table public.check_ins enable row level security;
