-- C-30 — RF-02: pago pendiente de membresía y alta atómica.
-- Un pago de membresía puede nacer sin membresia_id (todavía no existe la fila).
-- Al aprobarse, renovar_membresia cierra la activa e inserta la nueva en la misma transacción.

alter table public.pagos
  add column if not exists plan public.plan_membresia;

alter table public.pagos
  drop constraint if exists pagos_vinculo;

alter table public.pagos
  add constraint pagos_vinculo check (
    (
      concepto = 'membresia'
      and reserva_cancha_id is null
      and plan is not null
      and (
        (estado in ('pendiente', 'rechazado') and membresia_id is null)
        or (estado = 'aprobado' and membresia_id is not null)
      )
    )
    or (
      concepto = 'reserva_cancha'
      and reserva_cancha_id is not null
      and membresia_id is null
      and plan is null
    )
  );

comment on column public.pagos.plan is
  'Plan del catálogo cuando concepto = membresia. Nulo en pagos de cancha.';

-- Cierra las membresías activas del perfil e inserta la nueva con la vigencia del catálogo.
create or replace function public.renovar_membresia(
  p_perfil_id uuid,
  p_plan public.plan_membresia
)
returns public.membresias
language plpgsql
set search_path = public
as $$
declare
  v_meses integer;
  v_desde date;
  v_hasta date;
  v_row public.membresias;
begin
  select duracion_meses into v_meses
  from planes_membresia
  where plan = p_plan and activo;

  if v_meses is null then
    raise exception 'PLAN_INACTIVO';
  end if;

  v_desde := (timezone('America/Argentina/Buenos_Aires', now()))::date;
  v_hasta := (v_desde + make_interval(months => v_meses))::date;

  update membresias
  set estado = 'vencido'
  where perfil_id = p_perfil_id
    and estado = 'activo';

  insert into membresias (perfil_id, plan, estado, vigente_desde, vigente_hasta)
  values (p_perfil_id, p_plan, 'activo', v_desde, v_hasta)
  returning * into v_row;

  return v_row;
end;
$$;

revoke execute on function public.renovar_membresia(uuid, public.plan_membresia)
  from public, anon, authenticated;

grant execute on function public.renovar_membresia(uuid, public.plan_membresia)
  to service_role;
