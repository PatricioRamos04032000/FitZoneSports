-- C-39 — Lectura del dashboard del gerente (CQRS nivel 2).
-- Una fila por sede. Nest no arma el reporte recorriendo reservas, clases ni presencias.
-- El día es el calendario de America/Argentina/Buenos_Aires, el mismo de clases y del horario pico.

create view public.reporte_resumen_sede
with (security_invoker = true) as
select
  s.id,
  s.nombre,
  s.activa,
  s.aforo_max,
  (
    select count(*)::int
    from public.presencias p
    where p.sede_id = s.id
  ) as ocupacion,
  (
    select count(*)::int
    from public.reservas_cancha r
    join public.canchas c on c.id = r.cancha_id
    where c.sede_id = s.id
      and r.estado in ('pendiente', 'confirmada')
      and (r.inicio at time zone 'America/Argentina/Buenos_Aires')::date
        = (now() at time zone 'America/Argentina/Buenos_Aires')::date
  ) as reservas_del_dia,
  (
    select count(*)::int
    from public.clases cl
    where cl.sede_id = s.id
      and cl.estado = 'programada'
      and (cl.inicio at time zone 'America/Argentina/Buenos_Aires')::date
        = (now() at time zone 'America/Argentina/Buenos_Aires')::date
  ) as clases_del_dia,
  (now() at time zone 'America/Argentina/Buenos_Aires')::date as fecha
from public.sedes s;

revoke all on table public.reporte_resumen_sede from public, anon, authenticated;
grant select on table public.reporte_resumen_sede to service_role;
