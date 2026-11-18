-- RF-06 — El alta de una clase sigue siendo un insert en public.clases.
-- Estos checks impiden un tipo o un instructor en blanco.
-- No hay tabla ni función nueva. fin > inicio y capacidad_max > 0 ya están
-- en 20261005220000_membresias_clases.sql.

alter table public.clases
  add constraint clases_tipo_no_vacio
  check (char_length(btrim(tipo)) > 0);

alter table public.clases
  add constraint clases_instructor_no_vacio
  check (char_length(btrim(instructor)) > 0);
