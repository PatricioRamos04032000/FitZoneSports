export type ColaItemEstado = "pendiente" | "error";

export type ColaCheckInItem = {
  clientEventId: string;
  perfilId: string;
  code: string;
  sedeId: string;
  ocurrioEn: string;
  estado: ColaItemEstado;
  errorCode?: string;
  errorMessage?: string;
};

const STORAGE_KEY = "fitzone.acceso.cola";

export function loadCola(): ColaCheckInItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as ColaCheckInItem[];
  } catch {
    return [];
  }
}

export function saveCola(items: ColaCheckInItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function enqueueCheckIn(
  item: Omit<ColaCheckInItem, "estado" | "errorCode" | "errorMessage">
): ColaCheckInItem[] {
  const next: ColaCheckInItem[] = [
    ...loadCola(),
    { ...item, estado: "pendiente" },
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
