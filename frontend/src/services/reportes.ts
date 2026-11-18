import { apiRequest } from "./api";

export interface ResumenSede {
  id: string;
  nombre: string;
  activa: boolean;
  aforo_max: number;
  ocupacion: number;
  reservas_del_dia: number;
  clases_del_dia: number;
}

export interface ResumenCadena {
  ocupacion: number;
  aforo_max: number;
  reservas_del_dia: number;
  clases_del_dia: number;
}

export interface ResumenReporte {
  fecha: string;
  sedes: ResumenSede[];
  cadena: ResumenCadena;
}

export function obtenerResumen(accessToken: string) {
  return apiRequest<ResumenReporte>("/reportes/resumen", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
