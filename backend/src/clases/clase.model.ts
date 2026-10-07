export type EstadoClase = 'programada' | 'cancelada';
export type EstadoInscripcion = 'inscripto' | 'cancelada';

export interface Clase {
  id: string; // uuid
  sede_id: string; // uuid
  tipo: string; // Ej: "Spinning", "Yoga"
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

// Interfaz para la vista SQL que muestra los cupos
export interface ClaseConCupo extends Clase {
  cupos_libres: number;
  en_espera: number;
}