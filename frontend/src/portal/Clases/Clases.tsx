import { useCallback, useEffect, useState } from "react";
import "./Clases.css";
import { obtenerSedes, type Sede } from "../../services/canchas";
import {
  anotarseListaEspera,
  cancelarInscripcion,
  confirmarListaEspera,
  inscribir,
  listarClases,
  miListaEspera,
  misInscripciones,
  retirarListaEspera,
  type ClaseConCupo,
  type EsperaConClase,
  type InscripcionConClase,
} from "../../services/clases";
import { useAuth } from "../../store/useAuth";

function formatearFechaHora(iso: string) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) {
    return iso;
  }
  return fecha.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function Clases() {
  const { accessToken } = useAuth();

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [clases, setClases] = useState<ClaseConCupo[]>([]);
  const [inscripciones, setInscripciones] = useState<InscripcionConClase[]>(
    []
  );
  const [esperas, setEsperas] = useState<EsperaConClase[]>([]);

  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [cargandoClases, setCargandoClases] = useState(false);
  const [cargandoMias, setCargandoMias] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [accionId, setAccionId] = useState("");

  const sedeActual = sedes.find((sede) => sede.id === sedeSeleccionada);

  const refrescarMias = useCallback(async (token: string) => {
    setCargandoMias(true);
    try {
      const [misInscripcionesRes, miEsperaRes] = await Promise.all([
        misInscripciones(token),
        miListaEspera(token),
      ]);
      setInscripciones(misInscripcionesRes);
      setEsperas(
        miEsperaRes.filter(
          (entrada) =>
            entrada.estado === "esperando" || entrada.estado === "notificado"
        )
      );
    } finally {
      setCargandoMias(false);
    }
  }, []);

  const refrescarClases = useCallback(
    async (sedeId: string, token: string) => {
      setCargandoClases(true);
      try {
        const listado = await listarClases(sedeId, token);
        setClases(listado.filter((clase) => clase.estado === "programada"));
      } finally {
        setCargandoClases(false);
      }
    },
    []
  );

  useEffect(() => {
    async function cargarSedes() {
      try {
        setCargandoSedes(true);
        setError("");
        const respuesta = await obtenerSedes();
        const sedesActivas = respuesta.filter((sede) => sede.activa);
        setSedes(sedesActivas);
        if (sedesActivas.length > 0) {
          setSedeSeleccionada(sedesActivas[0].id);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudieron cargar las sedes."
        );
      } finally {
        setCargandoSedes(false);
      }
    }

    cargarSedes();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const token = accessToken;
    let activo = true;

    async function cargar() {
      try {
        setError("");
        await refrescarMias(token);
      } catch (err) {
        if (activo) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar tus inscripciones."
          );
        }
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [accessToken, refrescarMias]);

  useEffect(() => {
    if (!accessToken || !sedeSeleccionada) {
      return;
    }

    const token = accessToken;
    let activo = true;

    async function cargar() {
      try {
        setError("");
        await refrescarClases(sedeSeleccionada, token);
      } catch (err) {
        if (activo) {
          setClases([]);
          setError(
            err instanceof Error
              ? err.message
              : "No se pudieron cargar las clases."
          );
        }
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, [accessToken, sedeSeleccionada, refrescarClases]);

  async function conSesion(
    accion: (token: string) => Promise<void>,
    mensajeExito: string
  ) {
    if (!accessToken) {
      setError("Tu sesión expiró. Volvé a iniciar sesión.");
      return;
    }

    try {
      setError("");
      setMensaje("");
      await accion(accessToken);
      setMensaje(mensajeExito);
      if (sedeSeleccionada) {
        await refrescarClases(sedeSeleccionada, accessToken);
      }
      await refrescarMias(accessToken);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo completar la acción."
      );
    }
  }

  async function handleInscribir(claseId: string) {
    setAccionId(`inscribir-${claseId}`);
    await conSesion(
      (token) => inscribir(claseId, token).then(() => undefined),
      "Te inscribiste correctamente."
    );
    setAccionId("");
  }

  async function handleListaEspera(claseId: string) {
    setAccionId(`espera-${claseId}`);
    await conSesion(
      (token) => anotarseListaEspera(claseId, token).then(() => undefined),
      "Quedaste en la lista de espera."
    );
    setAccionId("");
  }

  async function handleCancelar(inscripcionId: string) {
    setAccionId(`cancelar-${inscripcionId}`);
    await conSesion(
      (token) => cancelarInscripcion(inscripcionId, token),
      "Inscripción cancelada."
    );
    setAccionId("");
  }

  async function handleConfirmar(esperaId: string) {
    setAccionId(`confirmar-${esperaId}`);
    await conSesion(
      (token) => confirmarListaEspera(esperaId, token).then(() => undefined),
      "Lugar confirmado. Ya estás inscripto."
    );
    setAccionId("");
  }

  async function handleRetirar(esperaId: string) {
    setAccionId(`retirar-${esperaId}`);
    await conSesion(
      (token) => retirarListaEspera(esperaId, token),
      "Te retiraste de la lista de espera."
    );
    setAccionId("");
  }

  const claseIdsInscripto = new Set(
    inscripciones
      .filter((item) => item.estado === "inscripto")
      .map((item) => item.clase_id)
  );
  const claseIdsEnEspera = new Set(esperas.map((item) => item.clase_id));

  return (
    <div className="clases-container">
      <h1>Clases</h1>

      <h2>Seleccionar sede</h2>
      {cargandoSedes ? (
        <p>Cargando sedes...</p>
      ) : (
        <select
          value={sedeSeleccionada}
          onChange={(e) => setSedeSeleccionada(e.target.value)}
        >
          <option value="">Seleccionar sede</option>
          {sedes.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </select>
      )}

      {sedeActual && <p>{sedeActual.direccion}</p>}

      {error && <p className="clases-error">{error}</p>}
      {mensaje && <p className="clases-ok">{mensaje}</p>}

      <h2>Clases disponibles</h2>

      {cargandoClases && <p>Cargando clases...</p>}

      {!cargandoSedes && sedes.length === 0 && (
        <p>No hay sedes activas disponibles.</p>
      )}

      {!cargandoClases && sedeSeleccionada && clases.length === 0 && (
        <p>No hay clases programadas para esta sede.</p>
      )}

      {!cargandoClases &&
        clases.map((clase) => {
          const yaInscripto = claseIdsInscripto.has(clase.id);
          const yaEnEspera = claseIdsEnEspera.has(clase.id);
          const puedeInscribir =
            clase.cupos_libres > 0 && !yaInscripto && !yaEnEspera;
          const puedeEsperar =
            clase.cupos_libres === 0 && !yaInscripto && !yaEnEspera;

          return (
            <div key={clase.id} className="clase-item">
              <h3>{clase.tipo}</h3>
              <p>Instructor: {clase.instructor}</p>
              <p>
                Horario: {formatearFechaHora(clase.inicio)} —{" "}
                {formatearFechaHora(clase.fin)}
              </p>
              <p>
                Cupos: {clase.cupos_libres} libres de {clase.capacidad_max}
                {clase.en_espera > 0
                  ? ` · ${clase.en_espera} en espera`
                  : ""}
              </p>

              {yaInscripto && <p>Ya estás inscripto en esta clase.</p>}
              {yaEnEspera && <p>Ya estás en la lista de espera.</p>}

              {puedeInscribir && (
                <button
                  type="button"
                  onClick={() => handleInscribir(clase.id)}
                  disabled={Boolean(accionId)}
                >
                  {accionId === `inscribir-${clase.id}`
                    ? "Inscribiendo..."
                    : "Inscribirme"}
                </button>
              )}

              {puedeEsperar && (
                <button
                  type="button"
                  onClick={() => handleListaEspera(clase.id)}
                  disabled={Boolean(accionId)}
                >
                  {accionId === `espera-${clase.id}`
                    ? "Anotando..."
                    : "Lista de espera"}
                </button>
              )}
            </div>
          );
        })}

      <h2>Mis inscripciones</h2>

      {cargandoMias && <p>Cargando tus inscripciones...</p>}

      {!cargandoMias &&
        inscripciones.filter((item) => item.estado === "inscripto").length ===
          0 && <p>No tenés inscripciones activas.</p>}

      {inscripciones
        .filter((item) => item.estado === "inscripto")
        .map((item) => (
          <div key={item.id} className="clase-item">
            <h3>{item.clase.tipo}</h3>
            {item.clase.instructor && (
              <p>Instructor: {item.clase.instructor}</p>
            )}
            <p>Inicio: {formatearFechaHora(item.clase.inicio)}</p>
            <p>Estado: {item.estado}</p>
            <button
              type="button"
              onClick={() => handleCancelar(item.id)}
              disabled={Boolean(accionId)}
            >
              {accionId === `cancelar-${item.id}`
                ? "Cancelando..."
                : "Cancelar inscripción"}
            </button>
          </div>
        ))}

      <h2>Mi lista de espera</h2>

      {!cargandoMias && esperas.length === 0 && (
        <p>No estás en ninguna lista de espera.</p>
      )}

      {esperas.map((item) => (
        <div key={item.id} className="clase-item">
          <h3>{item.clase.tipo}</h3>
          {item.clase.instructor && (
            <p>Instructor: {item.clase.instructor}</p>
          )}
          <p>Inicio: {formatearFechaHora(item.clase.inicio)}</p>
          <p>Estado: {item.estado}</p>
          {item.estado === "notificado" && item.vence_en && (
            <p>Confirmá antes de: {formatearFechaHora(item.vence_en)}</p>
          )}

          {item.estado === "notificado" && (
            <button
              type="button"
              onClick={() => handleConfirmar(item.id)}
              disabled={Boolean(accionId)}
            >
              {accionId === `confirmar-${item.id}`
                ? "Confirmando..."
                : "Confirmar lugar"}
            </button>
          )}

          <button
            type="button"
            className="clase-item-secundario"
            onClick={() => handleRetirar(item.id)}
            disabled={Boolean(accionId)}
          >
            {accionId === `retirar-${item.id}`
              ? "Retirando..."
              : "Retirarme"}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Clases;
