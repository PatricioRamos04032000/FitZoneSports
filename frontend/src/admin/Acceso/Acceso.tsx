import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../store/useAuth";
import { apiRequest, ApiError } from "../../services/api";
import {
  applySyncResults,
  discardColaItem,
  enqueueCheckIn,
  loadCola,
  type ColaCheckInItem,
} from "./accesoCola";
import "./Acceso.css";

type Sede = {
  id: string;
  nombre: string;
  activa: boolean;
};

type PerfilMe = {
  sede_home_id: string | null;
};

type PresenciaItem = {
  perfilId: string;
  sedeId: string;
  desde: string;
  nombre: string | null;
  apellido: string | null;
};

type PresenciasResponse = {
  sedeId: string;
  items: PresenciaItem[];
  ocupacion: number;
  aforoMax: number | null;
};

type SyncResponse = {
  results: Array<{
    clientEventId: string;
    ok: boolean;
    code?: string;
    message?: string;
  }>;
};

function parsePayload(raw: string): { perfilId: string; code: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const json = JSON.parse(trimmed) as {
      perfilId?: string;
      code?: string;
      v?: number;
    };
    if (json.perfilId && json.code) {
      return { perfilId: json.perfilId.trim(), code: String(json.code).trim() };
    }
  } catch {
    // no JSON: permitir "perfilId code" o "perfilId;code"
  }

  const parts = trimmed.split(/[\s,;|]+/).filter(Boolean);
  if (parts.length >= 2) {
    return { perfilId: parts[0], code: parts[1] };
  }
  return null;
}

function mensajeRecepcion(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case "YA_DENTRO":
        return "Esta persona ya está en la sede.";
      case "YA_EN_OTRA_SEDE":
        return "Esta persona ya figura dentro de otra sede.";
      case "MEMBRESIA_INACTIVA":
        return "La membresía del socio no está activa.";
      case "TOTP_INVALIDO":
      case "TOTP_SEED_AUSENTE":
        return "El código del QR no es válido o ya venció.";
      case "RED_NO_DISPONIBLE":
        return "Sin red: el ingreso queda pendiente de sincronizar.";
      default:
        return err.message || "No se pudo registrar el ingreso.";
    }
  }
  if (err instanceof Error) return err.message;
  return "No se pudo registrar el ingreso.";
}

function nombrePresencia(p: PresenciaItem): string {
  const nombre = [p.nombre, p.apellido].filter(Boolean).join(" ").trim();
  return nombre || "Socio sin nombre";
}

function Acceso() {
  const { accessToken } = useAuth();

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeId, setSedeId] = useState("");
  const [payload, setPayload] = useState("");
  const [perfilIdManual, setPerfilIdManual] = useState("");
  const [codeManual, setCodeManual] = useState("");
  const [presencias, setPresencias] = useState<PresenciasResponse | null>(null);
  const [cola, setCola] = useState<ColaCheckInItem[]>(() => loadCola());
  const [online, setOnline] = useState(
    () => typeof navigator !== "undefined" && navigator.onLine
  );

  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);
  const [feedback, setFeedback] = useState<{
    tipo: "ok" | "error" | "info";
    texto: string;
  } | null>(null);

  const authHeaders = useCallback(
    () =>
      accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : ({} as Record<string, string>),
    [accessToken]
  );

  const cargarPresencias = useCallback(
    async (sede: string) => {
      if (!accessToken || !sede) return;
      try {
        const data = (await apiRequest(
          `/acceso/presencias?sedeId=${encodeURIComponent(sede)}`,
          { headers: authHeaders() }
        )) as PresenciasResponse;
        setPresencias(data);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las personas dentro de la sede.";
        setFeedback({ tipo: "error", texto: msg });
      }
    },
    [accessToken, authHeaders]
  );

  useEffect(() => {
    if (!accessToken) return;

    const init = async () => {
      setCargando(true);
      try {
        const [sedesData, perfil] = await Promise.all([
          apiRequest("/sedes") as Promise<Sede[]>,
          apiRequest("/perfiles/me", {
            headers: authHeaders(),
          }) as Promise<PerfilMe>,
        ]);

        const activas = sedesData.filter((s) => s.activa);
        setSedes(activas);

        const preferida =
          (perfil.sede_home_id &&
            activas.find((s) => s.id === perfil.sede_home_id)?.id) ||
          activas[0]?.id ||
          "";
        setSedeId(preferida);
      } catch (err) {
        setFeedback({
          tipo: "error",
          texto:
            err instanceof Error
              ? err.message
              : "No se pudieron cargar sedes o perfil.",
        });
      } finally {
        setCargando(false);
      }
    };

    void init();
  }, [accessToken, authHeaders]);

  useEffect(() => {
    if (sedeId) void cargarPresencias(sedeId);
  }, [sedeId, cargarPresencias]);

  const sincronizarCola = useCallback(async () => {
    if (!accessToken) return;
    const pendientes = loadCola().filter((i) => i.estado === "pendiente");
    if (pendientes.length === 0) {
      setCola(loadCola());
      return;
    }

    setSincronizando(true);
    try {
      const data = (await apiRequest("/acceso/check-ins/sync", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          items: pendientes.map((i) => ({
            clientEventId: i.clientEventId,
            perfilId: i.perfilId,
            code: i.code,
            sedeId: i.sedeId,
            ocurrioEn: i.ocurrioEn,
          })),
        }),
      })) as SyncResponse;

      const next = applySyncResults(data.results);
      setCola(next);

      const oks = data.results.filter((r) => r.ok).length;
      const errs = data.results.filter((r) => !r.ok).length;
      setFeedback({
        tipo: errs > 0 ? "info" : "ok",
        texto: `Sincronización: ${oks} ok, ${errs} con error.`,
      });

      if (sedeId) void cargarPresencias(sedeId);
    } catch (err) {
      if (err instanceof ApiError && err.code === "RED_NO_DISPONIBLE") {
        setFeedback({
          tipo: "info",
          texto: "Sin red: la cola queda pendiente.",
        });
      } else {
        setFeedback({
          tipo: "error",
          texto:
            err instanceof Error ? err.message : "Falló la sincronización.",
        });
      }
    } finally {
      setSincronizando(false);
    }
  }, [accessToken, authHeaders, sedeId, cargarPresencias]);

  useEffect(() => {
    const onOnline = () => {
      setOnline(true);
      void sincronizarCola();
    };
    const onOffline = () => setOnline(false);

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [sincronizarCola]);

  async function registrar() {
    if (!accessToken || !sedeId) {
      setFeedback({ tipo: "error", texto: "Elegí una sede." });
      return;
    }

    const fromPayload = parsePayload(payload);
    const perfilId = (fromPayload?.perfilId || perfilIdManual).trim();
    const code = (fromPayload?.code || codeManual).trim();

    if (!perfilId || !code) {
      setFeedback({
        tipo: "error",
        texto: "Pegá el código del QR del socio o completá socio y código.",
      });
      return;
    }

    setEnviando(true);
    setFeedback(null);

    const clientEventId = crypto.randomUUID();
    const ocurrioEn = new Date().toISOString();

    const encolar = (motivo: string) => {
      const next = enqueueCheckIn({
        clientEventId,
        perfilId,
        code,
        sedeId,
        ocurrioEn,
      });
      setCola(next);
      setFeedback({
        tipo: "info",
        texto: `${motivo} Quedó pendiente de sincronizar.`,
      });
    };

    if (!navigator.onLine) {
      encolar("Sin red.");
      setEnviando(false);
      return;
    }

    try {
      await apiRequest("/acceso/check-ins", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ perfilId, code, sedeId }),
      });
      setFeedback({ tipo: "ok", texto: "Ingreso registrado." });
      setPayload("");
      setPerfilIdManual("");
      setCodeManual("");
      void cargarPresencias(sedeId);
    } catch (err) {
      if (err instanceof ApiError && err.code === "RED_NO_DISPONIBLE") {
        encolar("Fallo de red.");
      } else {
        setFeedback({ tipo: "error", texto: mensajeRecepcion(err) });
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="acceso-container">
      <header className="acceso-header">
        <h1>Acceso / Recepción</h1>
        <p>
          Escaneá o pegá el código del QR del socio. Sin red, el ingreso se
          guarda y se sincroniza después.
        </p>
      </header>

      <p className="acceso-online">
        Estado de red: <strong>{online ? "online" : "offline"}</strong>
        {cola.filter((c) => c.estado === "pendiente").length > 0 &&
          ` · ${cola.filter((c) => c.estado === "pendiente").length} en cola`}
      </p>

      <section className="acceso-card">
        <h2>Registrar ingreso</h2>

        {cargando ? (
          <p className="acceso-empty">Cargando sedes…</p>
        ) : (
          <>
            <label className="acceso-field">
              Sede
              <select
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
              >
                {sedes.length === 0 && (
                  <option value="">Sin sedes activas</option>
                )}
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </label>

            <label className="acceso-field">
              Código del QR
              <textarea
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Pegá acá el contenido del QR del socio"
              />
            </label>

            <label className="acceso-field">
              Socio (si no hay QR)
              <input
                value={perfilIdManual}
                onChange={(e) => setPerfilIdManual(e.target.value)}
                placeholder="Identificador del socio"
              />
            </label>

            <label className="acceso-field">
              Código de acceso
              <input
                value={codeManual}
                onChange={(e) => setCodeManual(e.target.value)}
                placeholder="6 dígitos"
              />
            </label>

            <div className="acceso-actions">
              <button
                type="button"
                className="acceso-button"
                disabled={enviando || !sedeId}
                onClick={() => void registrar()}
              >
                {enviando ? "Registrando…" : "Registrar ingreso"}
              </button>
            </div>
          </>
        )}

        {feedback && (
          <p
            className={`acceso-feedback acceso-feedback-${feedback.tipo === "ok" ? "ok" : feedback.tipo === "error" ? "error" : "info"}`}
          >
            {feedback.texto}
          </p>
        )}
      </section>

      <section className="acceso-card">
        <h2>
          En la sede
          {presencias
            ? ` (${presencias.ocupacion}${
                presencias.aforoMax != null ? ` / ${presencias.aforoMax}` : ""
              })`
            : ""}
        </h2>
        {!presencias || presencias.items.length === 0 ? (
          <p className="acceso-empty">Nadie dentro en esta sede.</p>
        ) : (
          <table className="acceso-table">
            <thead>
              <tr>
                <th>Socio</th>
                <th>Desde</th>
              </tr>
            </thead>
            <tbody>
              {presencias.items.map((p) => (
                <tr key={p.perfilId}>
                  <td>{nombrePresencia(p)}</td>
                  <td>{new Date(p.desde).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="acceso-card">
        <h2>Cola offline</h2>
        <div className="acceso-actions" style={{ marginBottom: 16 }}>
          <button
            type="button"
            className="acceso-button acceso-button-secondary"
            disabled={sincronizando || !online}
            onClick={() => void sincronizarCola()}
          >
            {sincronizando ? "Sincronizando…" : "Sincronizar"}
          </button>
        </div>

        {cola.length === 0 ? (
          <p className="acceso-empty">Cola vacía.</p>
        ) : (
          <table className="acceso-table">
            <thead>
              <tr>
                <th>Estado</th>
                <th>Evento</th>
                <th>Socio</th>
                <th>Detalle</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {cola.map((item) => (
                <tr key={item.clientEventId}>
                  <td>
                    <span
                      className={`acceso-badge acceso-badge-${item.estado}`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td>
                    <code>{item.clientEventId.slice(0, 8)}…</code>
                  </td>
                  <td>
                    <code>{item.perfilId.slice(0, 8)}…</code>
                  </td>
                  <td>
                    {item.estado === "error"
                      ? mensajeRecepcion(
                          new ApiError(
                            item.errorMessage || "Error al sincronizar",
                            { code: item.errorCode }
                          )
                        )
                      : new Date(item.ocurrioEn).toLocaleString()}
                  </td>
                  <td>
                    {item.estado === "error" && (
                      <button
                        type="button"
                        className="acceso-button acceso-button-ghost"
                        onClick={() =>
                          setCola(discardColaItem(item.clientEventId))
                        }
                      >
                        Descartar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Acceso;
