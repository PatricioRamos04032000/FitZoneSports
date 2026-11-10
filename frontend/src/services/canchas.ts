
import { apiRequest } from "./api";

// Sedes
export interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  aforo_max: number;
  activa: boolean;
}

// Tipos de cancha
export type TipoCancha = "paddle" | "futbol5" | "otro";

export type EstadoTurno =
  | "disponible"
  | "ocupado"
  | "mantenimiento";

// Turnos
export interface Turno {
  hora: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  esHorarioPico: boolean;
  precioExterno: number;
  precioSocio: number;
}

// Canchas con disponibilidad
export interface CanchaDisponibilidad {
  id: string;
  sedeId: string;
  nombre: string;
  tipo: TipoCancha;
  precioHora: number;
  turnos: Turno[];
}

// Respuesta de disponibilidad
export interface DisponibilidadSede {
  sedeId: string;
  fecha: string;
  descuentoSocioPct: number;
  canchas: CanchaDisponibilidad[];
}

// Reserva
export interface Reserva {
  id: string;
  canchaId: string;
  perfilId: string;
  inicio: string;
  fin: string;
  precio: number;
  estado: string;
}

// Pago
export interface PagoResponse {
  pagoId: string;
  checkoutUrl: string;
}

// Obtener sedes activas
export function obtenerSedes() {
  return apiRequest<Sede[]>("/sedes");
}

// Consultar disponibilidad de una sede
export function obtenerDisponibilidad(
  sedeId: string,
  fecha: string
) {
  const params = new URLSearchParams({ sedeId, fecha });

  return apiRequest<DisponibilidadSede>(
    `/canchas/disponibilidad?${params.toString()}`
  );
}

// Crear reserva
export function reservarCancha(
  canchaId: string,
  inicio: string,
  accessToken: string
) {
  return apiRequest<Reserva>("/canchas/reservas", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ canchaId, inicio }),
  });
}

// Obtener las reservas del usuario autenticado
export function obtenerMisReservas(accessToken: string) {
  return apiRequest<Reserva[]>("/canchas/reservas/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// Iniciar pago
export function iniciarPago(
  reservaId: string,
  accessToken: string
) {
  return apiRequest<PagoResponse>(
    `/canchas/reservas/${reservaId}/pagar`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
}
