export type EstadoClase = 'programada' | 'cancelada';
export type EstadoInscripcion = 'inscripto' | 'cancelada';
export type EstadoEspera =
  | 'esperando'
  | 'notificado'
  | 'inscripto'
  | 'retirado'
  | 'vencido';

export interface Clase {
  id: string;
  sede_id: string;
  tipo: string;
  instructor: string;
  inicio: string;
  fin: string;
  capacidad_max: number;
  estado: EstadoClase;
  created_at: string;
}

export interface InscripcionClase {
  id: string;
  clase_id: string;
  perfil_id: string;
  estado: EstadoInscripcion;
  created_at: string;
  cancelada_en?: string | null;
  cancelacion_tardia: boolean;
}

export interface ClaseResumenInscripcion {
  id: string;
  sede_id: string;
  tipo: string;
  instructor?: string;
  inicio: string;
  fin?: string;
}

/** Inscripción enriquecida con los datos de la clase desde la base (D6 y RF-08). */
export interface InscripcionConClase {
  id: string;
  perfil_id: string;
  clase_id: string;
  estado: EstadoInscripcion;
  created_at?: string;
  cancelada_en?: string | null;
  cancelacion_tardia?: boolean;
  clase: ClaseResumenInscripcion;
}

/** Fila de la tabla `public.lista_espera` (decisión D7, RF-08). */
export interface EntradaListaEspera {
  id: string;
  clase_id: string;
  perfil_id: string;
  estado: EstadoEspera;
  created_at: string;
  notificado_en?: string | null;
  vence_en?: string | null;
}

/** Entrada de lista de espera enriquecida con los datos de la clase. */
export interface EsperaConClase extends EntradaListaEspera {
  clase: ClaseResumenInscripcion;
}

/** Fila de la vista SQL `public.clases_con_cupo`. */
export interface ClaseConCupo extends Clase {
  cupos_libres: number;
  en_espera: number;
}
