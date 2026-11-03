-- S7-T01 — Confirmar reserva de cancha (pendiente → confirmada)
-- Usado por el Facade Nest tras cobro aprobado (State PendienteDePago.pagar).
-- Requiere: 20261027200000_canchas_m4.sql

create or replace function public.confirmar_reserva_cancha(p_reserva_id uuid)
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
  if v_reserva.estado = 'confirmada' then
    raise exception 'RESERVA_YA_CONFIRMADA';
  end if;
  if v_reserva.estado = 'cancelada' then
    raise exception 'RESERVA_CANCELADA';
  end if;
  if v_reserva.estado <> 'pendiente' then
    raise exception 'ESTADO_INVALIDO';
  end if;

  perform 1 from canchas where id = v_reserva.cancha_id for update;

  update reservas_cancha
  set estado = 'confirmada'
  where id = p_reserva_id
  returning * into v_reserva;

  return v_reserva;
end;
$$;

revoke execute on function public.confirmar_reserva_cancha(uuid)
  from public, anon, authenticated;

grant execute on function public.confirmar_reserva_cancha(uuid)
  to service_role;
