-- S7-T02b — Hold de reserva pendiente (ventana + lazy + pg_cron)
-- Ver: documentacion/Decisiones_Pendientes_y_Cosas_a_Definir.md §3.4.1
-- Requiere: 20261027200000_canchas_m4.sql, 20261031200000_confirmar_reserva_cancha.sql
--
-- Nota operativa: habilitar la extensión pg_cron en el proyecto Supabase
-- (Dashboard → Database → Extensions) si la migración no puede crearla sola.

-- ============ Config: minutos de hold ============

alter table public.configuracion_cadena
  add column if not exists minutos_hold_reserva integer not null default 10
    check (minutos_hold_reserva > 0 and minutos_hold_reserva <= 120);

-- ============ Limpieza de pendientes vencidas ============

create or replace function public.cancelar_reservas_pendientes_vencidas(
  p_cancha_id uuid default null,
  p_inicio timestamptz default null
)
returns integer
language plpgsql
set search_path = public
as $$
declare
  v_minutos integer;
  v_count integer;
begin
  select minutos_hold_reserva into v_minutos
  from configuracion_cadena
  where id = true;

  if v_minutos is null then
    v_minutos := 10;
  end if;

  with actualizadas as (
    update reservas_cancha r
    set estado = 'cancelada'
    where r.estado = 'pendiente'
      and r.created_at < now() - make_interval(mins => v_minutos)
      and (p_cancha_id is null or r.cancha_id = p_cancha_id)
      and (p_inicio is null or r.inicio = p_inicio)
    returning r.id
  )
  select count(*)::integer into v_count from actualizadas;

  return coalesce(v_count, 0);
end;
$$;

revoke execute on function public.cancelar_reservas_pendientes_vencidas(uuid, timestamptz)
  from public, anon, authenticated;

grant execute on function public.cancelar_reservas_pendientes_vencidas(uuid, timestamptz)
  to service_role;

-- ============ Lazy al reservar ============

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

  if date_trunc('hour', p_inicio) <> p_inicio then
    raise exception 'TURNO_NO_EN_HORA';
  end if;
  if p_inicio <= now() then
    raise exception 'TURNO_PASADO';
  end if;

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

  -- Lazy: libera holds vencidos de este turno antes del INSERT (RN-02).
  perform public.cancelar_reservas_pendientes_vencidas(p_cancha_id, p_inicio);

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

-- ============ Ventana al confirmar ============

create or replace function public.confirmar_reserva_cancha(p_reserva_id uuid)
returns public.reservas_cancha
language plpgsql
set search_path = public
as $$
declare
  v_reserva reservas_cancha;
  v_minutos integer;
begin
  select * into v_reserva from reservas_cancha where id = p_reserva_id for update;
  if not found then
    raise exception 'RESERVA_NO_EXISTE';
  end if;
  if v_reserva.estado = 'confirmada' then
    raise exception 'RESERVA_YA_CONFIRMADA';
  end if;
  if v_reserva.estado = 'cancelada' then
    raise exception 'RESERVA_CANCELADA';
  end if;
  if v_reserva.estado <> 'pendiente' then
    raise exception 'ESTADO_INVALIDO';
  end if;

  select minutos_hold_reserva into v_minutos
  from configuracion_cadena
  where id = true;
  if v_minutos is null then
    v_minutos := 10;
  end if;

  if v_reserva.created_at < now() - make_interval(mins => v_minutos) then
    update reservas_cancha
    set estado = 'cancelada'
    where id = p_reserva_id;
    raise exception 'RESERVA_VENCIDA';
  end if;

  perform 1 from canchas where id = v_reserva.cancha_id for update;

  update reservas_cancha
  set estado = 'confirmada'
  where id = p_reserva_id
  returning * into v_reserva;

  return v_reserva;
end;
$$;

-- ============ pg_cron (cada 1 minuto) ============

do $$
begin
  create extension if not exists pg_cron with schema pg_catalog;
exception
  when others then
    raise notice 'pg_cron no disponible en este entorno: %. Habilitarla en Dashboard → Extensions. Lazy + ventana siguen activos.',
      SQLERRM;
end;
$$;

do $$
begin
  if exists (
    select 1 from pg_extension where extname = 'pg_cron'
  ) then
    perform cron.unschedule(jobid)
    from cron.job
    where jobname = 'cancelar_reservas_pendientes_vencidas';

    perform cron.schedule(
      'cancelar_reservas_pendientes_vencidas',
      '*/5 * * * *',
      $cron$ select public.cancelar_reservas_pendientes_vencidas(); $cron$
    );
  end if;
exception
  when others then
    raise notice 'No se pudo programar pg_cron: %.', SQLERRM;
end;
$$;
