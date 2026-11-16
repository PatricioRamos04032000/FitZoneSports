export type ColaItemEstado = "pendiente" | "error";

export type TipoColaAcceso = "entrada" | "salida";

export type ColaCheckInItem = {
  clientEventId: string;
  perfilId: string;
  /** Una cola guardada antes de C-33 no trae `tipo`: se lee como entrada. */
  tipo: TipoColaAcceso;
  /** Lo lleva una entrada. Una salida no. */
  code?: string;
  sedeId: string;
  ocurrioEn: string;
  estado: ColaItemEstado;
  errorCode?: string;
  errorMessage?: string;
};

type ColaGuardada = {
  clientEventId?: unknown;
  perfilId?: unknown;
  tipo?: unknown;
  code?: unknown;
  sedeId?: unknown;
  ocurrioEn?: unknown;
  estado?: unknown;
  errorCode?: unknown;
  errorMessage?: unknown;
};

function normalizarItem(raw: unknown): ColaCheckInItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as ColaGuardada;
  if (
    typeof item.clientEventId !== "string" ||
    typeof item.perfilId !== "string" ||
    typeof item.sedeId !== "string" ||
    typeof item.ocurrioEn !== "string"
  ) {
    return null;
  }

  const tipo: TipoColaAcceso = item.tipo === "salida" ? "salida" : "entrada";
  return {
    clientEventId: item.clientEventId,
    perfilId: item.perfilId,
    tipo,
    code:
      tipo === "salida"
        ? undefined
        : typeof item.code === "string"
          ? item.code
          : undefined,
    sedeId: item.sedeId,
    ocurrioEn: item.ocurrioEn,
    estado: item.estado === "error" ? "error" : "pendiente",
    errorCode: typeof item.errorCode === "string" ? item.errorCode : undefined,
    errorMessage:
      typeof item.errorMessage === "string" ? item.errorMessage : undefined,
  };
}

const STORAGE_KEY = "fitzone.acceso.cola";

export function loadCola(): ColaCheckInItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(normalizarItem)
      .filter((item): item is ColaCheckInItem => item !== null);
  } catch {
    return [];
  }
}

export function saveCola(items: ColaCheckInItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function enqueueCheckIn(
  item: Omit<
    ColaCheckInItem,
    "estado" | "errorCode" | "errorMessage" | "tipo" | "code"
  > & {
    tipo?: TipoColaAcceso;
    code?: string;
  }
): ColaCheckInItem[] {
  const tipo: TipoColaAcceso = item.tipo === "salida" ? "salida" : "entrada";
  const next: ColaCheckInItem[] = [
    ...loadCola(),
    {
      clientEventId: item.clientEventId,
      perfilId: item.perfilId,
      sedeId: item.sedeId,
      ocurrioEn: item.ocurrioEn,
      tipo,
      estado: "pendiente",
      ...(tipo === "entrada" ? { code: item.code } : {}),
    },
  ];
  saveCola(next);
  return next;
}

/** Quita ok; marca errores; deja pendientes no tocados. */
export function applySyncResults(
  results: Array<{
    clientEventId: string;
    ok: boolean;
    code?: string;
    message?: string;
  }>
): ColaCheckInItem[] {
  const byId = new Map(results.map((r) => [r.clientEventId, r]));
  const next = loadCola()
    .map((item) => {
      const r = byId.get(item.clientEventId);
      if (!r) return item;
      if (r.ok) return null;
      return {
        ...item,
        estado: "error" as const,
        errorCode: r.code,
        errorMessage: r.message,
      };
    })
    .filter((x): x is ColaCheckInItem => x !== null);

  saveCola(next);
  return next;
}

export function discardColaItem(clientEventId: string): ColaCheckInItem[] {
  const next = loadCola().filter((i) => i.clientEventId !== clientEventId);
  saveCola(next);
  return next;
}
