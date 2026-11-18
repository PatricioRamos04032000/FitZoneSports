const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  readonly code: string | undefined;
  readonly status: number;

  constructor(message: string, options?: { code?: string; status?: number }) {
    super(message);
    this.name = "ApiError";
    this.code = options?.code;
    this.status = options?.status ?? 0;
  }
}

function normalizarMensaje(data: unknown): { message: string; code?: string } {
  if (!data || typeof data !== "object") {
    return { message: "Error al comunicarse con el servidor" };
  }

  const body = data as {
    message?: unknown;
    code?: unknown;
    error?: unknown;
  };

  // Nest: { message: { code, message } } o { message: string | string[], code? }
  if (body.message && typeof body.message === "object" && !Array.isArray(body.message)) {
    const nested = body.message as { code?: unknown; message?: unknown };
    const message =
      typeof nested.message === "string"
        ? nested.message
        : Array.isArray(nested.message)
          ? nested.message.join(", ")
          : "Error al comunicarse con el servidor";
    const code =
      typeof nested.code === "string"
        ? nested.code
        : typeof body.code === "string"
          ? body.code
          : undefined;
    return { message, code };
  }

  if (Array.isArray(body.message)) {
    return {
      message: body.message.join(", "),
      code: typeof body.code === "string" ? body.code : undefined,
    };
  }

  if (typeof body.message === "string") {
    return {
      message: body.message,
      code: typeof body.code === "string" ? body.code : undefined,
    };
  }

  if (typeof body.error === "string") {
    return { message: body.error };
  }

  return { message: "Error al comunicarse con el servidor" };
}

let alCerrarSesion: (() => void) | undefined;

/** El AuthProvider registra `logout`. Un 401 con Bearer cierra la sesión una sola vez. */
export function registrarCierreDeSesion(handler: () => void) {
  alCerrarSesion = handler;
}

function llevaBearer(headers: HeadersInit | undefined): boolean {
  if (!headers) {
    return false;
  }

  let valor: string | undefined;
  if (headers instanceof Headers) {
    valor = headers.get("Authorization") ?? undefined;
  } else if (Array.isArray(headers)) {
    const par = headers.find(
      ([clave]) => clave.toLowerCase() === "authorization"
    );
    valor = par?.[1];
  } else {
    const clave = Object.keys(headers).find(
      (nombre) => nombre.toLowerCase() === "authorization"
    );
    valor = clave ? headers[clave] : undefined;
  }

  return typeof valor === "string" && valor.startsWith("Bearer ");
}

// Default `any` para no forzar tipado en Login/Signup existentes.
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError("Sin conexión con el servidor", {
      code: "RED_NO_DISPONIBLE",
      status: 0,
    });
  }

  let data: unknown = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    if (response.status === 401 && llevaBearer(options.headers)) {
      alCerrarSesion?.();
    }
    const { message, code } = normalizarMensaje(data);
    throw new ApiError(message, { code, status: response.status });
  }

  return data as T;
}
