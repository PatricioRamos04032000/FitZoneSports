import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../../store/useAuth";
import {
  actualizarSede,
  crearSede,
  listarSedes,
  type SedeAdmin,
} from "../../services/sedes";
import "./Sedes.css";

const AFORO_INICIAL = "50";

function Sedes() {
  const { accessToken } = useAuth();

  const [sedes, setSedes] = useState<SedeAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [aforo, setAforo] = useState(AFORO_INICIAL);
  const [activa, setActiva] = useState(true);
  const [guardando, setGuardando] = useState(false);

  async function cargar(token: string) {
    const data = await listarSedes(token);
    setSedes(data);
  }

  useEffect(() => {
    if (!accessToken) return;

    let cancelado = false;
    void (async () => {
      try {
        const data = await listarSedes(accessToken);
        if (!cancelado) setSedes(data);
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error ? err.message : "No se pudieron cargar las sedes."
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [accessToken]);

  function limpiarFormulario() {
    setEditandoId(null);
    setNombre("");
    setDireccion("");
    setAforo(AFORO_INICIAL);
    setActiva(true);
  }

  function empezarEdicion(sede: SedeAdmin) {
    setEditandoId(sede.id);
    setNombre(sede.nombre);
    setDireccion(sede.direccion ?? "");
    setAforo(String(sede.aforo_max));
    setActiva(sede.activa);
    setError("");
    setMensaje("");
  }

  async function guardar(event: FormEvent) {
    event.preventDefault();
    if (!accessToken) return;

    setError("");
    setMensaje("");

    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError("El nombre es obligatorio.");
      return;
    }

    const aforoNumero = Number(aforo);
    if (!Number.isInteger(aforoNumero) || aforoNumero <= 0) {
      setError("El aforo tiene que ser un entero mayor a 0.");
      return;
    }

    const datos = {
      nombre: nombreLimpio,
      direccion: direccion.trim() || null,
      aforo_max: aforoNumero,
      activa,
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await actualizarSede(accessToken, editandoId, datos);
        setMensaje("Sede actualizada.");
      } else {
        await crearSede(accessToken, datos);
        setMensaje("Sede creada. El horario pico quedó con los valores por defecto.");
      }
      await cargar(accessToken);
      limpiarFormulario();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la sede.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="sedes-container">
      <header className="sedes-header">
        <h1>Sedes</h1>
        <p>
          Una sede nueva es un dato de la cadena: no hace falta desplegar de
          nuevo. Desactivarla la oculta en las reservas y no borra canchas ni
          turnos ya tomados.
        </p>
      </header>

      <form className="sedes-card" onSubmit={(event) => void guardar(event)}>
        <h2>{editandoId ? "Editar sede" : "Nueva sede"}</h2>

        <label className="sedes-field">
          Nombre
          <input
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            required
          />
        </label>

        <label className="sedes-field">
          Dirección
          <input
            value={direccion}
            onChange={(event) => setDireccion(event.target.value)}
          />
        </label>

        <label className="sedes-field">
          Aforo máximo
          <input
            type="number"
            min={1}
            step={1}
            value={aforo}
            onChange={(event) => setAforo(event.target.value)}
            required
          />
        </label>

        <label className="sedes-check">
          <input
            type="checkbox"
            checked={activa}
            onChange={(event) => setActiva(event.target.checked)}
          />
          Activa
        </label>

        {error && <p className="sedes-error">{error}</p>}
        {mensaje && <p className="sedes-ok">{mensaje}</p>}

        <div className="sedes-actions">
          <button className="sedes-button" type="submit" disabled={guardando}>
            {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear sede"}
          </button>
          {editandoId && (
            <button
              className="sedes-button sedes-button-ghost"
              type="button"
              onClick={limpiarFormulario}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <section className="sedes-card">
        <h2>Cadena</h2>
        {cargando ? (
          <p>Cargando sedes...</p>
        ) : sedes.length === 0 ? (
          <p>Todavía no hay sedes.</p>
        ) : (
          <ul className="sedes-lista">
            {sedes.map((sede) => (
              <li key={sede.id}>
                <div>
                  <strong>{sede.nombre}</strong>
                  <span>{sede.activa ? "Activa" : "Inactiva"}</span>
                  <p>{sede.direccion || "Sin dirección"}</p>
                  <p>Aforo {sede.aforo_max}</p>
                </div>
                <button type="button" onClick={() => empezarEdicion(sede)}>
                  Editar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Sedes;
