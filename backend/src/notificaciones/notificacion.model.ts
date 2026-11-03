export type TipoNotificacion = 'lugar_liberado';

/** Fila de `public.notificaciones`. */
export interface Notificacion {
  id: string;
  perfil_id: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  datos: Record<string, unknown>;
  leida_en: string | null;
  created_at: string;
}

export type NuevaNotificacion = Pick<
  Notificacion,
  'perfil_id' | 'tipo' | 'titulo' | 'mensaje' | 'datos'
>;

/** Columnas de `public.perfiles` con las preferencias de notificación. */
export interface PreferenciasNotificacion {
  notificar_por_email: boolean;
}
