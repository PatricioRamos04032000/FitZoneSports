/** Fila de `public.sedes`. */
export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  aforo_max: number;
  activa: boolean;
  created_at: string;
}
