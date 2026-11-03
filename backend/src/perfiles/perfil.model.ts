import type { RolUsuario } from '../auth/rol-usuario';

/** Fila de public.perfiles. */
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

/** Campos que el propio usuario puede editar. */
export type ActualizarPerfil = Partial<
  Pick<
    Perfil,
    | 'dni'
    | 'nombre'
    | 'apellido'
    | 'telefono'
    | 'foto_url'
    | 'sede_home_id'
    | 'notificar_por_email'
  >
>;