export type TipoCheckIn = 'entrada' | 'salida';
export type OrigenCheckIn = 'online' | 'offline_sync';

export type TotpSeed = {
  id: string;
  perfil_id: string;
  seed_cifrado: string;
  activo: boolean;
  rotado_en: string | null;
  created_at: string;
};

export type Presencia = {
  perfil_id: string;
  sede_id: string;
  desde: string;
};

export type CheckIn = {
  id: string;
  perfil_id: string;
  sede_id: string;
  tipo: TipoCheckIn;
  origen: OrigenCheckIn;
  ocurrio_en: string;
  client_event_id: string | null;
  created_at: string;
};
