
import { useEffect, useState } from "react";
import { useAuth } from "../../store/useAuth";
import { apiRequest } from "../../services/api";
import "./Perfil.css";

interface PerfilData {
  id: string;
  rol: string;
  dni: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  foto_url: string | null;
  sede_home_id: string | null;
  notificar_por_email: boolean;
  created_at: string;
  email?: string;
}

interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  activa: boolean;
}

function Perfil() {
  const { accessToken } = useAuth();

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [preferenciaEmail, setPreferenciaEmail] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardandoPreferencia, setGuardandoPreferencia] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    const cargarDatos = async () => {
      try {
        const [perfilData, sedesData] = await Promise.all([
          apiRequest("/perfiles/me", {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }) as Promise<PerfilData>,

          apiRequest("/sedes") as Promise<Sede[]>,
        ]);

        setPerfil(perfilData);
        setPreferenciaEmail(perfilData.notificar_por_email);
        setSedes(sedesData.filter((sede) => sede.activa));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar los datos del perfil."
        );
      } finally {
        setCargando(false);
      }
    };

    void cargarDatos();
  }, [accessToken]);

  function actualizarCampo(
    campo: "nombre" | "apellido" | "dni" | "telefono" | "sede_home_id",
    valor: string
  ) {
    if (!perfil) return;

    setPerfil({
      ...perfil,
      [campo]: campo === "sede_home_id" && valor === "" ? null : valor,
    });
  }

  async function guardarCambios() {
    if (!perfil || !accessToken) return;

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      const perfilActualizado = (await apiRequest("/perfiles/me", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          nombre: perfil.nombre,
          apellido: perfil.apellido,
          dni: perfil.dni,
          telefono: perfil.telefono,
          sede_home_id: perfil.sede_home_id,
        }),
      })) as PerfilData;

      setPerfil(perfilActualizado);
      setMensaje("¡Tus datos se actualizaron correctamente!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron guardar los cambios."
      );
    } finally {
      setGuardando(false);
    }
  }

  async function guardarPreferenciaEmail(nuevaPreferencia: boolean) {
  if (!perfil || !accessToken) return;

  const preferenciaAnterior = perfil.notificar_por_email;

  setPreferenciaEmail(nuevaPreferencia);
  setGuardandoPreferencia(true);
  setError("");

  try {
    const perfilActualizado = (await apiRequest("/perfiles/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        notificar_por_email: nuevaPreferencia,
      }),
    })) as PerfilData;

    setPerfil(perfilActualizado);
    setPreferenciaEmail(perfilActualizado.notificar_por_email);
  } catch (err) {
    setPreferenciaEmail(preferenciaAnterior);
    setError(
      err instanceof Error
        ? err.message
        : "No se pudo actualizar la preferencia de email."
    );
  } finally {
    setGuardandoPreferencia(false);
  }
}

  if (cargando) {
    return <p className="perfil-estado">Cargando perfil...</p>;
  }

  if (!perfil) {
    return (
      <div className="perfil-estado">
        <p>{error || "No se encontró tu perfil."}</p>
      </div>
    );
  }

  const sedeActual = sedes.find(
    (sede) => sede.id === perfil.sede_home_id
  );

  return (
    <section className="perfil-container">
      <div className="perfil-header">
        <h1>Mi Perfil</h1>
        <p>Consultá y actualizá tu información personal.</p>
      </div>

      <div className="perfil-card">
        <h2>Información personal</h2>

        <div className="perfil-grid">
          <label>
            Nombre
            <input
              type="text"
              value={perfil.nombre}
              onChange={(e) => actualizarCampo("nombre", e.target.value)}
            />
          </label>

          <label>
            Apellido
            <input
              type="text"
              value={perfil.apellido ?? ""}
              onChange={(e) => actualizarCampo("apellido", e.target.value)}
            />
          </label>

          <label>
            DNI
            <input
              type="text"
              value={perfil.dni}
              onChange={(e) => actualizarCampo("dni", e.target.value)}
            />
          </label>

          <label>
            Teléfono
            <input
              type="text"
              value={perfil.telefono ?? ""}
              onChange={(e) => actualizarCampo("telefono", e.target.value)}
            />
          </label>

          <label>
            Sede habitual
            <select
              value={perfil.sede_home_id ?? ""}
              onChange={(e) =>
                actualizarCampo("sede_home_id", e.target.value)
              }
            >
              <option value="">Sin sede habitual</option>
              {sedes.map((sede) => (
                <option key={sede.id} value={sede.id}>
                  {sede.nombre}
                </option>
              ))}
            </select>

            {perfil.sede_home_id && !sedeActual && (
              <small>
                La sede asignada actualmente no está disponible.
              </small>
            )}
          </label>
        </div>

        <button
          className="perfil-button"
          onClick={guardarCambios}
          disabled={guardando}
        >
          {guardando ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <div className="perfil-card">
        <h2>Información de la cuenta</h2>

        <div className="perfil-info">
          <p>
            <strong>Email:</strong> {perfil.email ?? "No disponible"}
          </p>

          <p>
            <strong>Rol:</strong> {perfil.rol}
          </p>

          <p>
            <strong>Miembro desde:</strong>{" "}
            {new Date(perfil.created_at).toLocaleDateString("es-AR")}
          </p>

          <div className="perfil-preferencia">
            <div className="perfil-preferencia-texto">
              <strong>Notificaciones por email</strong>
              <span>
                Elegí si querés recibir novedades y notificaciones de FitZone
                en tu correo electrónico.
              </span>
            </div>

            <label className="perfil-switch">
              <span className="perfil-switch-nombre">
                Notificaciones por email
              </span>
              <input
                type="checkbox"
                checked={preferenciaEmail}
                disabled={guardandoPreferencia}
                onChange={(e) => guardarPreferenciaEmail(e.target.checked)}
              />
              <span className="perfil-switch-slider"></span>
            </label>
          </div>


        </div>
      </div>

      {mensaje && <p className="perfil-success">{mensaje}</p>}
      {error && <p className="perfil-error">{error}</p>}
    </section>
  );
}

export default Perfil;
