import { apiRequest } from "./api";

export interface SedeAdmin {
  id: string;
  nombre: string;
  direccion: string | null;
  aforo_max: number;
  activa: boolean;
  created_at: string;
}

export interface SedeEditable {
  nombre: string;
  direccion: string | null;
  aforo_max: number;
  activa: boolean;
}

export function listarSedes(accessToken: string) {
  return apiRequest<SedeAdmin[]>("/sedes", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function crearSede(accessToken: string, datos: SedeEditable) {
  return apiRequest<SedeAdmin>("/sedes", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(datos),
  });
}

export function actualizarSede(
  accessToken: string,
  id: string,
  datos: Partial<SedeEditable>
) {
  return apiRequest<SedeAdmin>(`/sedes/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(datos),
  });
}
