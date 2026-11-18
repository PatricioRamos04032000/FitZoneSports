import { ApiError, apiRequest } from "./api";

const API_URL = import.meta.env.VITE_API_URL;

export interface ResumenPago {
  id: string;
  concepto: "membresia" | "reserva_cancha";
  monto: number;
  estado: "pendiente" | "aprobado" | "rechazado";
  reservaCanchaId: string | null;
  membresiaId: string | null;
  plan: "mensual" | "trimestral" | "anual" | null;
  createdAt: string;
}

export function obtenerMisPagos(accessToken: string) {
  return apiRequest<ResumenPago[]>("/pagos/mios", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export function descargarComprobanteReserva(
  reservaId: string,
  accessToken: string
) {
  return descargarPdf(
    `/canchas/reservas/${reservaId}/comprobante`,
    accessToken,
    `comprobante-reserva-${reservaId.slice(0, 8)}.pdf`
  );
}

export function descargarComprobantePago(pagoId: string, accessToken: string) {
  return descargarPdf(
    `/pagos/${pagoId}/comprobante`,
    accessToken,
    `comprobante-fitzone-${pagoId.slice(0, 8)}.pdf`
  );
}

async function descargarPdf(
  endpoint: string,
  accessToken: string,
  nombrePorDefecto: string
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch {
    throw new ApiError("Sin conexión con el servidor", {
      code: "RED_NO_DISPONIBLE",
      status: 0,
    });
  }

  if (!response.ok) {
    let mensaje = "No se pudo descargar el comprobante";
    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (typeof data.message === "string") {
        mensaje = data.message;
      } else if (Array.isArray(data.message)) {
        mensaje = data.message.join(", ");
      }
    } catch {
      // Si el backend no devolvió JSON, se mantiene el mensaje por defecto.
    }
    throw new ApiError(mensaje, { status: response.status });
  }

  const blob = await response.blob();
  const nombreArchivo =
    extraerNombreArchivo(response.headers.get("content-disposition")) ??
    nombrePorDefecto;

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nombreArchivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function extraerNombreArchivo(header: string | null): string | null {
  if (!header) return null;
  const match = /filename="?([^";]+)"?/i.exec(header);
  return match?.[1] ?? null;
}
