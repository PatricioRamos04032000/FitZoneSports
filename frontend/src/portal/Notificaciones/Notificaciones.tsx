
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../store/useAuth";
import { apiRequest } from "../../services/api";
import "./Notificaciones.css";

interface NotificacionData {
  id: string;
  perfil_id: string;
  tipo: "lugar_liberado";
  titulo: string;
  mensaje: string;
  datos: Record<string, unknown>;
  leida_en: string | null;
  created_at: string;
}

function Notificaciones() {
  const { accessToken } = useAuth();

  const [notificaciones, setNotificaciones] = useState<NotificacionData[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [marcandoId, setMarcandoId] = useState<string | null>(null);

  const cargarNotificaciones = useCallback(async () => {
    if (!accessToken) return [];

    return await apiRequest<NotificacionData[]>("/notificaciones", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    let cancelado = false;

    async function cargarInicial() {
      try {
        const data = await cargarNotificaciones();

        if (!cancelado) {
          setNotificaciones(data);
        }
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las notificaciones."
          );
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    }

    void cargarInicial();

    return () => {
      cancelado = true;
    };
  }, [accessToken, cargarNotificaciones]);

  async function actualizarNotificaciones() {
    setCargando(true);
    setError("");

    try {
      const data = await cargarNotificaciones();
      setNotificaciones(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar las notificaciones."
      );
    } finally {
      setCargando(false);
    }
  }

  async function marcarComoLeida(id: string) {
    if (!accessToken) return;

    setMarcandoId(id);
    setError("");

    try {
      await apiRequest(`/notificaciones/${id}/leida`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setNotificaciones((actuales) =>
        actuales.map((notificacion) =>
          notificacion.id === id
            ? { ...notificacion, leida_en: new Date().toISOString() }
            : notificacion
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo marcar la notificación como leída."
      );
    } finally {
      setMarcandoId(null);
    }
  }

  const noLeidas = notificaciones.filter(
    (notificacion) => notificacion.leida_en === null
  ).length;

  return (
    <section className="notificaciones-container">
      <div className="notificaciones-header">
        <div>
          <h1>Notificaciones</h1>
          <p>
            Tené a mano las novedades y avisos de FitZone Sports.
          </p>
        </div>

        <button
          className="notificaciones-actualizar"
          onClick={() => void actualizarNotificaciones()}
          disabled={cargando}
        >
          {cargando ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {!cargando && (
        <p className="notificaciones-contador">
          {noLeidas}{" "}
          {noLeidas === 1
            ? "notificación sin leer"
            : "notificaciones sin leer"}
        </p>
      )}

      {error && (
        <div className="notificaciones-error">
          {error}
        </div>
      )}

      {cargando ? (
        <p className="notificaciones-mensaje">
          Cargando notificaciones...
        </p>
      ) : notificaciones.length === 0 ? (
        <div className="notificaciones-vacias">
          <h2>No tenés notificaciones</h2>
          <p>Cuando haya novedades, aparecerán acá.</p>
        </div>
      ) : (
        <div className="notificaciones-lista">
          {notificaciones.map((notificacion) => (
            <article
              key={notificacion.id}
              className={`notificacion-card ${
                notificacion.leida_en ? "leida" : "no-leida"
              }`}
            >
              <div className="notificacion-contenido">
                <div className="notificacion-titulo">
                  <h2>{notificacion.titulo}</h2>

                  {!notificacion.leida_en && (
                    <span className="notificacion-nueva">
                      Nueva
                    </span>
                  )}
                </div>

                <p>{notificacion.mensaje}</p>

                <span className="notificacion-fecha">
                  {new Date(notificacion.created_at).toLocaleString("es-AR")}
                </span>
              </div>

              {!notificacion.leida_en && (
                <button
                  className="notificacion-leer"
                  onClick={() => void marcarComoLeida(notificacion.id)}
                  disabled={marcandoId === notificacion.id}
                >
                  {marcandoId === notificacion.id
                    ? "Guardando..."
                    : "Marcar como leída"}
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default Notificaciones;
