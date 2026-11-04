export type EstadoClase = 'programada' | 'cancelada';
export type EstadoInscripcion = 'inscripto' | 'cancelada';

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

/** Fila de la vista SQL `public.clases_con_cupo`. */
export interface ClaseConCupo extends Clase {
  cupos_libres: number;
  en_espera: number;
}
