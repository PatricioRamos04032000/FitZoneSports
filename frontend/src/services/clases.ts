import { apiRequest } from "./api";

export type EstadoClase = "programada" | "cancelada";
export type EstadoInscripcion = "inscripto" | "cancelada";
export type EstadoEspera =
  | "esperando"
  | "notificado"
  | "inscripto"
  | "retirado"
  | "vencido";

export interface ClaseConCupo {
  id: string;
  sede_id: string;
  tipo: string;
  instructor: string;
  inicio: string;
  fin: string;
  capacidad_max: number;
  estado: EstadoClase;
  created_at: string;
  cupos_libres: number;
  en_espera: number;
}

export interface ClaseResumen {
  id: string;
  sede_id: string;
  tipo: string;
  instructor?: string;
  inicio: string;
  fin?: string;
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

export interface InscripcionConClase {
  id: string;
  perfil_id: string;
  clase_id: string;
  estado: EstadoInscripcion;
  created_at?: string;
  cancelada_en?: string | null;
  cancelacion_tardia?: boolean;
  clase: ClaseResumen;
}

export interface EntradaListaEspera {
  id: string;
  clase_id: string;
  perfil_id: string;
  estado: EstadoEspera;
  created_at: string;
  notificado_en?: string | null;
  vence_en?: string | null;
}

export interface EsperaConClase extends EntradaListaEspera {
  clase: ClaseResumen;
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

export function listarClases(sedeId: string, accessToken: string) {
  const params = new URLSearchParams({ sedeId });
  return apiRequest<ClaseConCupo[]>(`/clases?${params.toString()}`, {
    headers: authHeaders(accessToken),
  });
}

export function misInscripciones(accessToken: string) {
  return apiRequest<InscripcionConClase[]>(
    "/clases/inscripciones/mias",
    {
      headers: authHeaders(accessToken),
    }
  );
}

export function inscribir(claseId: string, accessToken: string) {
  return apiRequest<InscripcionClase>("/clases/inscripciones", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ claseId }),
  });
}

export function cancelarInscripcion(
  inscripcionId: string,
  accessToken: string
) {
  return apiRequest<void>(`/clases/inscripciones/${inscripcionId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}

export function miListaEspera(accessToken: string) {
  return apiRequest<EsperaConClase[]>("/clases/lista-espera/mias", {
    headers: authHeaders(accessToken),
  });
}

export function anotarseListaEspera(
  claseId: string,
  accessToken: string
) {
  return apiRequest<EntradaListaEspera>("/clases/lista-espera", {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify({ claseId }),
  });
}

export function confirmarListaEspera(
  esperaId: string,
  accessToken: string
) {
  return apiRequest<InscripcionClase>(
    `/clases/lista-espera/${esperaId}/confirmar`,
    {
      method: "POST",
      headers: authHeaders(accessToken),
    }
  );
}

export function retirarListaEspera(
  esperaId: string,
  accessToken: string
) {
  return apiRequest<void>(`/clases/lista-espera/${esperaId}`, {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });
}
