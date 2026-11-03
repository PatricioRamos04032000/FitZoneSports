export type PlanMembresia = 'mensual' | 'trimestral' | 'anual';
export type EstadoMembresia = 'activo' | 'vencido' | 'suspendido';

/** Fila exacta de la tabla public.membresias en Supabase */
export interface Membresia {
  id: string; // uuid
  perfil_id: string; // uuid
  plan: PlanMembresia;
  estado: EstadoMembresia;
  vigente_desde: string; // date
  vigente_hasta: string; // date
}