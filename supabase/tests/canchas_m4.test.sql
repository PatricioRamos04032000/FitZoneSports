-- SOLO para un PostgreSQL local de prueba. NO ejecutar en Supabase.
-- Cadena: 00_fase_a_simulada.sql → 20260915000000 → 20261005220000
--          → 20261006190000 → 20261027200000_canchas_m4.sql → este archivo.
-- Cada caso imprime "OK n"; si alguno falla, psql corta con el error.
\set ON_ERROR_STOP 1
set client_min_messages = notice;
set timezone = 'America/Argentina/Buenos_Aires';

insert into auth.users (id) values
  ('00000000-0000-0000-0000-0000000000a1'),
  ('00000000-0000-0000-0000-0000000000a2'),
  ('00000000-0000-0000-0000-0000000000a3');

insert into sedes (id, nombre) values
  ('10000000-0000-0000-0000-0000000000c1', 'Norte');

insert into perfiles (id, rol, dni, nombre) values
  ('00000000-0000-0000-0000-0000000000a1', 'socio', '101', 'Socio'),
  ('00000000-0000-0000-0000-0000000000a2', 'externo', '102', 'Externo'),
  ('00000000-0000-0000-0000-0000000000a3', 'admin_sede', '103', 'Admin');

insert into admins_sede (perfil_id, sede_id) values
  ('00000000-0000-0000-0000-0000000000a3', '10000000-0000-0000-0000-0000000000c1');

insert into canchas (id, sede_id, tipo, nombre, precio_hora) values
  ('30000000-0000-0000-0000-000000000001',
   '10000000-0000-0000-0000-0000000000c1',
   'paddle', 'Paddle 1', 20000);

set role service_role;

do $$
declare
  k constant uuid := '30000000-0000-0000-0000-000000000001';
  a constant uuid := '00000000-0000-0000-0000-0000000000a1';
  b constant uuid := '00000000-0000-0000-0000-0000000000a2';
  v_inicio timestamptz;
  v_res reservas_cancha;
  v_err text;
  v_n int;
  v_pct numeric;
begin
  -- 1. Defaults: pico al crear sede + cadena 15%
  assert (select count(*) from configuracion_pico
          where sede_id = '10000000-0000-0000-0000-0000000000c1') = 1,
         'falta configuracion_pico de la sede';
  select descuento_socio_pct into v_pct from configuracion_cadena;
  assert v_pct = 15, format('descuento_socio_pct=%s', v_pct);
  raise notice 'OK 1  defaults pico (sede) y cadena (15%%)';

  -- Turno futuro en hora en punto (mañana a las 10).
  v_inicio := date_trunc('day', now()) + interval '1 day 10 hours';

  -- 2. Primera reserva ok
  v_res := reservar_cancha(
    k, a, v_inicio, 20000,
    '{"base":20000,"reglas":[]}'::jsonb,
    'confirmada'
  );
  assert v_res.fin = v_inicio + interval '1 hour';
  assert v_res.precio = 20000;
  raise notice 'OK 2  reserva confirmada (fin = inicio + 1 h)';

  -- 3. Sobreventa del mismo turno
  begin
    perform reservar_cancha(k, b, v_inicio, 20000);
    raise exception 'FALLO: sobreventa';
  exception when others then
    v_err := sqlerrm;
  end;
  assert v_err = 'TURNO_OCUPADO', v_err;
  raise notice 'OK 3  sobreventa rechazada (TURNO_OCUPADO)';

  -- 4. Cancelar libera el turno; otro perfil puede reservar
  v_res := cancelar_reserva_cancha(v_res.id);
  assert v_res.estado = 'cancelada';
  v_res := reservar_cancha(k, b, v_inicio, 17000, '{"base":20000}'::jsonb, 'pendiente');
  assert v_res.estado = 'pendiente' and v_res.perfil_id = b;
  raise notice 'OK 4  cancelación libera turno; B reserva pendiente';

  -- 5. Mantenimiento bloquea el turno
  perform cancelar_reserva_cancha(v_res.id);
  insert into mantenimientos_cancha (cancha_id, desde, hasta, motivo)
  values (k, v_inicio - interval '1 hour', v_inicio + interval '2 hours', 'pintura');
  begin
    perform reservar_cancha(k, a, v_inicio, 20000);
    raise exception 'FALLO: reservó en mantenimiento';
  exception when others then
    v_err := sqlerrm;
  end;
  assert v_err = 'CANCHA_EN_MANTENIMIENTO', v_err;
  raise notice 'OK 5  mantenimiento bloquea reserva (CANCHA_EN_MANTENIMIENTO)';

  -- 6. Turno fuera de hora
  begin
    perform reservar_cancha(k, a, v_inicio + interval '30 minutes', 20000);
    raise exception 'FALLO: aceptó media hora';
  exception when others then
    v_err := sqlerrm;
  end;
  assert v_err = 'TURNO_NO_EN_HORA', v_err;
  raise notice 'OK 6  turno fuera de hora rechazado (TURNO_NO_EN_HORA)';

  -- 7. Horizonte > 1 mes
  begin
    perform reservar_cancha(
      k, a,
      date_trunc('hour', now() + interval '1 month 2 days'),
      20000
    );
    raise exception 'FALLO: aceptó fuera de horizonte';
  exception when others then
    v_err := sqlerrm;
  end;
  assert v_err = 'FUERA_DE_HORIZONTE', v_err;
  raise notice 'OK 7  horizonte 1 mes (FUERA_DE_HORIZONTE)';

  -- 8. Rol renombrado y admins_sede
  select count(*) into v_n from perfiles where rol = 'admin_sede';
  assert v_n = 1;
  assert (select count(*) from admins_sede) = 1;
  raise notice 'OK 8  rol admin_sede y admins_sede';
end $$;

reset role;
set role anon;
do $$
declare
  v_n int;
  v_err text;
begin
  select count(*) into v_n from canchas;
  assert v_n = 0, 'anon ve canchas';
  begin
    perform reservar_cancha(
      '30000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-0000000000a1',
      date_trunc('day', now()) + interval '2 day 11 hours',
      20000
    );
    raise exception 'FALLO: anon ejecutó reservar_cancha';
  exception when insufficient_privilege then
    v_err := 'denegado';
  end;
  raise notice 'OK 9  RLS: anon no ve canchas ni ejecuta RPC (%)', v_err;
end $$;
reset role;
