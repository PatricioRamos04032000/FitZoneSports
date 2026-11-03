import { ReservaCancha } from './reserva-cancha.model';

/** Fila mínima de `reservas_cancha` para tests unitarios. */
export function reservaCanchaFixture(
  overrides: Partial<ReservaCancha> = {},
): ReservaCancha {
  return {
    id: 'r1',
    cancha_id: 'c1',
    perfil_id: 'p1',
    inicio: '2026-11-15T19:00:00+00:00',
    fin: '2026-11-15T20:00:00+00:00',
    precio: 20000,
    detalle: {},
    estado: 'pendiente',
    created_at: '2026-10-31T00:00:00+00:00',
    ...overrides,
  };
}
