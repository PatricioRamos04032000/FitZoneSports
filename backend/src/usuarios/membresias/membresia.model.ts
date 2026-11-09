export const PLANES_MEMBRESIA = ['mensual', 'trimestral', 'anual'] as const;
export type PlanMembresia = (typeof PLANES_MEMBRESIA)[number];

export type EstadoMembresia = 'activo' | 'vencido' | 'suspendido';

/** Fila de la tabla `public.membresias` en Supabase. */
export interface Membresia {
  id: string;
  perfil_id: string;
  plan: PlanMembresia;
  estado: EstadoMembresia;
  vigente_desde: string; // YYYY-MM-DD
  vigente_hasta: string; // YYYY-MM-DD
  created_at?: string;
}

/** Fila de la tabla `public.planes_membresia` (decisión D2). */
export interface PlanMembresiaFila {
  plan: PlanMembresia;
  duracion_meses: number;
  precio: number;
  activo: boolean;
  updated_at?: string;
}

/** Datos requeridos para insertar una nueva membresía activa. */
export interface NuevaMembresiaRow {
  perfil_id: string;
  plan: PlanMembresia;
  estado: EstadoMembresia;
  vigente_desde: string;
  vigente_hasta: string;
}
