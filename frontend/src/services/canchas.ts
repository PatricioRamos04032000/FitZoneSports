
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

export interface CanchaAdmin {
  id: string;
  sedeId: string;
  nombre: string;
  tipo: TipoCancha;
  precioHora: number;
  activa: boolean;
  createdAt: string;
}

export interface MantenimientoCancha {
  id: string;
  canchaId: string;
  desde: string;
  hasta: string;
  motivo: string | null;
  createdAt: string;
}

export interface ConfiguracionPico {
  sedeId: string;
  recargoPct: number;
  desde: string;
  hasta: string;
  dias: number[];
}

export interface DescuentoSocio {
  descuentoSocioPct: number;
}

function conToken(accessToken: string): HeadersInit {
  return { Authorization: `Bearer ${accessToken}` };
}

export function listarCanchasAdmin(sedeId: string, accessToken: string) {
  const params = new URLSearchParams({
    sedeId,
    incluirInactivas: "true",
  });
  return apiRequest<CanchaAdmin[]>(`/canchas?${params.toString()}`, {
    headers: conToken(accessToken),
  });
}

export function crearCancha(
  accessToken: string,
  datos: {
    sedeId: string;
    nombre: string;
    tipo: TipoCancha;
    precioHora: number;
  }
) {
  return apiRequest<CanchaAdmin>("/canchas", {
    method: "POST",
    headers: conToken(accessToken),
    body: JSON.stringify(datos),
  });
}

export function actualizarCancha(
  accessToken: string,
  canchaId: string,
  datos: { nombre: string; precioHora: number; activa: boolean }
) {
  return apiRequest<CanchaAdmin>(`/canchas/${canchaId}`, {
    method: "PATCH",
    headers: conToken(accessToken),
    body: JSON.stringify(datos),
  });
}

export function listarMantenimientos(canchaId: string, accessToken: string) {
  return apiRequest<MantenimientoCancha[]>(
    `/canchas/${canchaId}/mantenimientos`,
    { headers: conToken(accessToken) }
  );
}

export function crearMantenimiento(
  accessToken: string,
  canchaId: string,
  datos: { desde: string; hasta: string; motivo?: string }
) {
  return apiRequest<MantenimientoCancha>(
    `/canchas/${canchaId}/mantenimientos`,
    {
      method: "POST",
      headers: conToken(accessToken),
      body: JSON.stringify(datos),
    }
  );
}

export function eliminarMantenimiento(
  accessToken: string,
  canchaId: string,
  mantenimientoId: string
) {
  return apiRequest<void>(
    `/canchas/${canchaId}/mantenimientos/${mantenimientoId}`,
    { method: "DELETE", headers: conToken(accessToken) }
  );
}

export function obtenerPico(sedeId: string, accessToken: string) {
  return apiRequest<ConfiguracionPico>(
    `/sedes/${sedeId}/configuracion-pico`,
    { headers: conToken(accessToken) }
  );
}

export function guardarPico(
  accessToken: string,
  sedeId: string,
  datos: {
    recargoPct: number;
    desde: string;
    hasta: string;
    dias: number[];
  }
) {
  return apiRequest<ConfiguracionPico>(
    `/sedes/${sedeId}/configuracion-pico`,
    {
      method: "PUT",
      headers: conToken(accessToken),
      body: JSON.stringify(datos),
    }
  );
}

export function obtenerDescuento(accessToken: string) {
  return apiRequest<DescuentoSocio>("/configuracion/descuento-socio", {
    headers: conToken(accessToken),
  });
}

export function guardarDescuento(accessToken: string, descuentoSocioPct: number) {
  return apiRequest<DescuentoSocio>("/configuracion/descuento-socio", {
    method: "PUT",
    headers: conToken(accessToken),
    body: JSON.stringify({ descuentoSocioPct }),
  });
}

export function cancelarReserva(reservaId: string, accessToken: string) {
  return apiRequest<Reserva>(`/canchas/reservas/${reservaId}/cancelar`, {
    method: "POST",
    headers: conToken(accessToken),
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
