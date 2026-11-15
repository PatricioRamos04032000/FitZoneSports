import { FormEvent, useEffect, useState } from "react";
import {
  crearClase,
  editarClase,
  listarClases,
  type ClaseConCupo,
  type EstadoClase,
} from "../../services/clases";
import { listarSedes, type SedeAdmin } from "../../services/sedes";
import { useAuth } from "../../store/useAuth";
import {
  aDatetimeLocal,
  desdeDatetimeLocal,
  formatearHorario,
} from "../../horario";
import "./GestionarClases.css";

function lugaresOcupados(clase: ClaseConCupo) {
  return clase.capacidad_max - clase.cupos_libres;
}

function GestionarClases() {
  const { accessToken } = useAuth();

  const [sedes, setSedes] = useState<SedeAdmin[]>([]);
  const [sedeId, setSedeId] = useState("");
  const [clases, setClases] = useState<ClaseConCupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tipo, setTipo] = useState("");
  const [instructor, setInstructor] = useState("");
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");
  const [capacidad, setCapacidad] = useState("12");
  const [estado, setEstado] = useState<EstadoClase>("programada");
  const [guardando, setGuardando] = useState(false);

  const sedeActual = sedes.find((sede) => sede.id === sedeId);

  function limpiarFormulario() {
    setEditandoId(null);
    setTipo("");
    setInstructor("");
    setInicio("");
    setFin("");
    setCapacidad("12");
    setEstado("programada");
  }

  useEffect(() => {
    if (!accessToken) return;

    let cancelado = false;
    void (async () => {
      try {
        const data = await listarSedes(accessToken);
        if (cancelado) return;
        setSedes(data);
        setSedeId((actual) => actual || data[0]?.id || "");
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

  useEffect(() => {
    if (!accessToken || !sedeId) return;

    let cancelado = false;
    void (async () => {
      try {
        const data = await listarClases(sedeId, accessToken);
        if (!cancelado) setClases(data);
      } catch (err) {
        if (!cancelado) {
          setClases([]);
          setError(
            err instanceof Error ? err.message : "No se pudieron cargar las clases."
          );
        }
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [accessToken, sedeId]);

  function empezarEdicion(clase: ClaseConCupo) {
    setEditandoId(clase.id);
    setTipo(clase.tipo);
    setInstructor(clase.instructor);
    setInicio(aDatetimeLocal(clase.inicio));
    setFin(aDatetimeLocal(clase.fin));
    setCapacidad(String(clase.capacidad_max));
    setEstado(clase.estado);
    setError("");
    setMensaje("");
  }

  async function guardar(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !sedeId) return;

    setError("");
    setMensaje("");

    const tipoLimpio = tipo.trim();
    const instructorLimpio = instructor.trim();
    if (!tipoLimpio || !instructorLimpio) {
      setError("El tipo y el instructor son obligatorios.");
      return;
    }
    if (!inicio || !fin || fin <= inicio) {
      setError("El fin tiene que ser posterior al inicio.");
      return;
    }

    const capacidadNumero = Number(capacidad);
    if (!Number.isInteger(capacidadNumero) || capacidadNumero <= 0) {
      setError("La capacidad tiene que ser un entero mayor a 0.");
      return;
    }

    if (!editandoId && sedeActual && !sedeActual.activa) {
      setError("La sede está inactiva. Elegí una sede activa para crear la clase.");
      return;
    }

    const datos = {
      tipo: tipoLimpio,
      instructor: instructorLimpio,
      inicio: desdeDatetimeLocal(inicio),
      fin: desdeDatetimeLocal(fin),
      capacidadMax: capacidadNumero,
    };

    setGuardando(true);
    try {
      if (editandoId) {
        await editarClase(accessToken, editandoId, { ...datos, estado });
        setMensaje("Clase actualizada.");
      } else {
        await crearClase(accessToken, { ...datos, sedeId });
        setMensaje("Clase creada.");
      }
      setClases(await listarClases(sedeId, accessToken));
      limpiarFormulario();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la clase.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <h1>Agenda de clases</h1>
        <p>
          El alta deja la clase programada. Cancelarla no borra las
          inscripciones ni avisa a la lista de espera. Para pasarla de sede,
          cancelala y creá otra. Los horarios se leen en hora de Argentina.
        </p>
      </header>

      <form className="agenda-card" onSubmit={(event) => void guardar(event)}>
        <h2>{editandoId ? "Editar clase" : "Nueva clase"}</h2>

        <label className="agenda-field">
          Sede
          <select
            value={sedeId}
            disabled={editandoId !== null}
            onChange={(event) => {
              setSedeId(event.target.value);
              setError("");
              setMensaje("");
            }}
          >
            {sedes.map((sede) => (
              <option key={sede.id} value={sede.id}>
                {sede.nombre}
                {sede.activa ? "" : " (inactiva)"}
              </option>
            ))}
          </select>
        </label>

        <label className="agenda-field">
          Tipo
          <input
            value={tipo}
            onChange={(event) => setTipo(event.target.value)}
            required
          />
        </label>

        <label className="agenda-field">
          Instructor
          <input
            value={instructor}
            onChange={(event) => setInstructor(event.target.value)}
            required
          />
        </label>

        <div className="agenda-row">
          <label className="agenda-field">
            Inicio
            <input
              type="datetime-local"
              value={inicio}
              onChange={(event) => setInicio(event.target.value)}
              required
            />
          </label>
          <label className="agenda-field">
            Fin
            <input
              type="datetime-local"
              value={fin}
              onChange={(event) => setFin(event.target.value)}
              required
            />
          </label>
        </div>

        <label className="agenda-field">
          Capacidad
          <input
            type="number"
            min={1}
            step={1}
            value={capacidad}
            onChange={(event) => setCapacidad(event.target.value)}
            required
          />
        </label>

        {editandoId && (
          <label className="agenda-field">
            Estado
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as EstadoClase)}
            >
              <option value="programada">Programada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </label>
        )}

        {error && <p className="agenda-error">{error}</p>}
        {mensaje && <p className="agenda-ok">{mensaje}</p>}

        <div className="agenda-actions">
          <button className="agenda-button" type="submit" disabled={guardando || !sedeId}>
            {guardando ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear clase"}
          </button>
          {editandoId && (
            <button
              className="agenda-button agenda-button-ghost"
              type="button"
              onClick={limpiarFormulario}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <section className="agenda-card">
        <h2>Clases de la sede</h2>
        {cargando ? (
          <p>Cargando sedes...</p>
        ) : !sedeId ? (
          <p>Todavía no hay sedes.</p>
        ) : clases.length === 0 ? (
          <p>Esta sede no tiene clases.</p>
        ) : (
          <ul className="agenda-lista">
            {clases.map((clase) => (
              <li key={clase.id}>
                <div>
                  <strong>{clase.tipo}</strong>
                  <span>{clase.estado === "cancelada" ? "Cancelada" : "Programada"}</span>
                  <p>
                    {clase.instructor} · {formatearHorario(clase.inicio)} a{" "}
                    {formatearHorario(clase.fin)}
                  </p>
                  <p>
                    Capacidad {clase.capacidad_max} · ocupados {lugaresOcupados(clase)} ·
                    cupos libres {clase.cupos_libres}
                  </p>
                </div>
                <button type="button" onClick={() => empezarEdicion(clase)}>
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

export default GestionarClases;
