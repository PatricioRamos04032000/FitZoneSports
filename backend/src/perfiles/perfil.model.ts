import type { RolUsuario } from '../auth/rol-usuario';

/** Fila de `public.perfiles` (campos expuestos por la API). */
export interface Perfil {
  id: string;
  rol: RolUsuario;
  dni: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  foto_url: string | null;
  sede_home_id: string | null;
  notificar_por_email: boolean;
  created_at: string;
}

/** Campos que el propio usuario puede editar con PATCH /perfiles/me. */
export type ActualizarPerfil = Partial<
  Pick<Perfil, 'dni' | 'nombre' | 'apellido' | 'telefono' | 'foto_url' | 'sede_home_id'>
>;
