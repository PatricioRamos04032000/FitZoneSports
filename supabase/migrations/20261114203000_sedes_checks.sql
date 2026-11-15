-- RNF-04 — El alta de una sede sigue siendo un insert en public.sedes.
-- Estos checks impiden un nombre en blanco y un aforo que no cuenta personas.
-- No se toca el trigger sedes_after_insert_configuracion_pico: el POST de Nest
-- inserta solo en sedes y Postgres crea la fila de horario pico.

alter table public.sedes
  add constraint sedes_nombre_no_vacio
  check (char_length(btrim(nombre)) > 0);

alter table public.sedes
  add constraint sedes_aforo_positivo
  check (aforo_max > 0);
