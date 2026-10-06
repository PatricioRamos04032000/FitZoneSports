-- SOLO para un PostgreSQL local de prueba (ver 00_fase_a_simulada.sql). NO ejecutar en Supabase.
-- Cada caso imprime "OK n"; si alguno falla, psql corta con el error.
\set ON_ERROR_STOP 1
set client_min_messages = notice;

-- Datos: 1 sede, 4 socios (A, B, C, D), 1 clase con capacidad 1
insert into auth.users (id) values
  ('00000000-0000-0000-0000-00000000000a'), ('00000000-0000-0000-0000-00000000000b'),
  ('00000000-0000-0000-0000-00000000000c'), ('00000000-0000-0000-0000-00000000000d');
insert into sedes (id, nombre) values ('10000000-0000-0000-0000-000000000001', 'Central');
insert into perfiles (id, rol, dni, nombre) values
  ('00000000-0000-0000-0000-00000000000a', 'socio', '1', 'A'),
  ('00000000-0000-0000-0000-00000000000b', 'socio', '2', 'B'),
  ('00000000-0000-0000-0000-00000000000c', 'socio', '3', 'C'),
  ('00000000-0000-0000-0000-00000000000d', 'socio', '4', 'D');
insert into clases (id, sede_id, tipo, instructor, inicio, fin, capacidad_max) values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001',
   'Spinning', 'Laura', now() + interval '1 day', now() + interval '1 day 1 hour', 1);

set role service_role;

do $$
declare
  k constant uuid := '20000000-0000-0000-0000-000000000001';
  a constant uuid := '00000000-0000-0000-0000-00000000000a';
  b constant uuid := '00000000-0000-0000-0000-00000000000b';
  c constant uuid := '00000000-0000-0000-0000-00000000000c';
  d constant uuid := '00000000-0000-0000-0000-00000000000d';
  v_insc inscripciones_clase;
  v_esp lista_espera;
  v_n int;
  v_err text;
begin
  -- 1. Membresías: historial con una sola activa
  insert into membresias (perfil_id, plan, estado, vigente_desde, vigente_hasta)
  values (a, 'mensual', 'vencido', '2026-08-01', '2026-08-31'),
         (a, 'mensual', 'activo', '2026-09-01', '2026-09-30');
  begin
    insert into membresias (perfil_id, plan, vigente_desde, vigente_hasta) values (a, 'anual', '2026-10-01', '2027-09-30');
    raise exception 'FALLO: permitió dos membresías activas';
  exception when unique_violation then raise notice 'OK 1  membresías: historial permitido, segunda activa rechazada';
  end;

  -- 2. A toma el único lugar; B no puede
  v_insc := inscribir_en_clase(k, a);
  begin
    perform inscribir_en_clase(k, b);
    raise exception 'FALLO: sobreventa';
  exception when others then v_err := sqlerrm;
  end;
  assert v_err = 'CLASE_LLENA', v_err;
  raise notice 'OK 2  clase llena: B rechazado con CLASE_LLENA';

  -- 3. B y C se anotan en lista de espera
  insert into lista_espera (clase_id, perfil_id) values (k, b);
  perform pg_sleep(0.01);
  insert into lista_espera (clase_id, perfil_id) values (k, c);

  -- 4. A cancela tarde: se notifica a B (primero) y su lugar queda reservado
  select * into v_esp from cancelar_inscripcion(v_insc.id, true, interval '30 minutes');
  assert v_esp.perfil_id = b and v_esp.estado = 'notificado', 'no notificó a B';
  assert (select cancelacion_tardia from inscripciones_clase where id = v_insc.id), 'no marcó cancelación tardía';
  select cupos_libres into v_n from clases_con_cupo where id = k;
  assert v_n = 0, 'el lugar de B no quedó reservado';
  raise notice 'OK 3  cancelación tardía registrada; B notificado; cupo reservado (cupos_libres = 0)';

  -- 5. D intenta reservar directo: no puede adelantarse a C
  begin
    perform inscribir_en_clase(k, d);
    raise exception 'FALLO: D se coló';
  exception when others then v_err := sqlerrm;
  end;
  assert v_err in ('HAY_LISTA_DE_ESPERA', 'CLASE_LLENA'), v_err;
  raise notice 'OK 4  D no se adelanta a la lista (%)', v_err;

  -- 6. B confirma a tiempo
  v_insc := confirmar_lugar_espera(v_esp.id);
  assert v_insc.perfil_id = b;
  assert (select estado from lista_espera where id = v_esp.id) = 'inscripto';
  raise notice 'OK 5  B confirmó y quedó inscripto';

  -- 7. B cancela: se notifica a C con un plazo que ya venció
  select * into v_esp from cancelar_inscripcion(v_insc.id, false, interval '-1 second');
  assert v_esp.perfil_id = c;
  begin
    perform confirmar_lugar_espera(v_esp.id);
    raise exception 'FALLO: confirmó fuera de plazo';
  exception when others then v_err := sqlerrm;
  end;
  assert v_err = 'PLAZO_VENCIDO', v_err;
  raise notice 'OK 6  C no puede confirmar fuera de plazo (PLAZO_VENCIDO)';

  -- 8. Procesar la lista: C vence, no queda nadie, se libera el lugar y D reserva
  select count(*) into v_n from procesar_lista_espera(k, interval '30 minutes');
  assert v_n = 0;
  assert (select estado from lista_espera where id = v_esp.id) = 'vencido';
  select cupos_libres into v_n from clases_con_cupo where id = k;
  assert v_n = 1, 'el lugar no se liberó';
  v_insc := inscribir_en_clase(k, d);
  raise notice 'OK 7  C vencido; lugar liberado; D reservó directo';

  -- 9. Doble inscripción del mismo socio
  update clases set capacidad_max = 5 where id = k;
  begin
    perform inscribir_en_clase(k, d);
    raise exception 'FALLO: doble inscripción';
  exception when unique_violation then raise notice 'OK 8  doble inscripción rechazada';
  end;
end $$;

-- 10. RLS y permisos: anon no ve tablas ni ejecuta funciones
reset role;
set role anon;
do $$
declare v_n int; v_err text;
begin
  select count(*) into v_n from sedes;
  assert v_n = 0, 'anon ve sedes';
  begin
    perform inscribir_en_clase('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-00000000000a');
    raise exception 'FALLO: anon ejecutó la función';
  exception when insufficient_privilege then v_err := 'denegado';
  end;
  raise notice 'OK 9  RLS: anon ve 0 sedes y no puede ejecutar funciones (%)', v_err;
end $$;
reset role;
