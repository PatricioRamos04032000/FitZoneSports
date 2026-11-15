import { FormEvent, useEffect, useState } from "react";
import {
  actualizarCancha,
  crearCancha,
  crearMantenimiento,
  eliminarMantenimiento,
  guardarDescuento,
  guardarPico,
  listarCanchasAdmin,
  listarMantenimientos,
  obtenerDescuento,
  obtenerPico,
  type CanchaAdmin,
  type ConfiguracionPico,
  type MantenimientoCancha,
  type TipoCancha,
} from "../../services/canchas";
import { listarSedes, type SedeAdmin } from "../../services/sedes";
import { useAuth } from "../../store/useAuth";
import {
  aDatetimeLocal,
  desdeDatetimeLocal,
  formatearHorario,
} from "../../horario";
import "../Clases/GestionarClases.css";

const TIPOS: { valor: TipoCancha; etiqueta: string }[] = [
  { valor: "paddle", etiqueta: "Paddle" },
  { valor: "futbol5", etiqueta: "Fútbol 5" },
  { valor: "otro", etiqueta: "Otro" },
];
const DIAS = [
  { valor: 1, etiqueta: "Lun" },
  { valor: 2, etiqueta: "Mar" },
  { valor: 3, etiqueta: "Mié" },
  { valor: 4, etiqueta: "Jue" },
  { valor: 5, etiqueta: "Vie" },
  { valor: 6, etiqueta: "Sáb" },
  { valor: 7, etiqueta: "Dom" },
];
const HORAS = Array.from({ length: 24 }, (_, hora) =>
  `${String(hora).padStart(2, "0")}:00`
);

function textoError(err: unknown, fallback: string) {
  return err instanceof Error ? err.message : fallback;
}

function precioValido(valor: string) {
  const numero = Number(valor);
  return Number.isFinite(numero) && numero >= 0;
}

function GestionarCanchas() {
  const { accessToken, user } = useAuth();
  const esGerente = user?.rol === "gerente";

  const [sedes, setSedes] = useState<SedeAdmin[]>([]);
  const [sedeId, setSedeId] = useState("");
  const [canchas, setCanchas] = useState<CanchaAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<TipoCancha>("paddle");
  const [precio, setPrecio] = useState("20000");
  const [activa, setActiva] = useState(true);
  const [guardandoCancha, setGuardandoCancha] = useState(false);

  const [canchaId, setCanchaId] = useState("");
  const [mantenimientos, setMantenimientos] = useState<MantenimientoCancha[]>([]);
  const [desdeMant, setDesdeMant] = useState("");
  const [hastaMant, setHastaMant] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardandoMant, setGuardandoMant] = useState(false);

  const [pico, setPico] = useState<ConfiguracionPico | null>(null);
  const [recargo, setRecargo] = useState("20");
  const [desdePico, setDesdePico] = useState("19:00");
  const [hastaPico, setHastaPico] = useState("21:00");
  const [dias, setDias] = useState<number[]>([1, 2, 3, 4, 5]);
  const [guardandoPico, setGuardandoPico] = useState(false);

  const [descuento, setDescuento] = useState("15");
  const [guardandoDescuento, setGuardandoDescuento] = useState(false);

  function limpiarCancha() {
    setEditandoId(null);
    setNombre("");
    setTipo("paddle");
    setPrecio("20000");
    setActiva(true);
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
          setError(textoError(err, "No se pudieron cargar las sedes."));
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
        const [lista, franja, cadena] = await Promise.all([
          listarCanchasAdmin(sedeId, accessToken),
          obtenerPico(sedeId, accessToken),
          obtenerDescuento(accessToken),
        ]);
        if (cancelado) return;
        setCanchas(lista);
        setPico(franja);
        setRecargo(String(franja.recargoPct));
        setDesdePico(franja.desde);
        setHastaPico(franja.hasta);
        setDias(franja.dias);
        setDescuento(String(cadena.descuentoSocioPct));
        setCanchaId((actual) =>
          lista.some((cancha) => cancha.id === actual) ? actual : ""
        );
      } catch (err) {
        if (!cancelado) {
          setCanchas([]);
          setError(textoError(err, "No se pudieron cargar las canchas."));
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [accessToken, sedeId]);

  useEffect(() => {
    if (!accessToken || !canchaId) {
      setMantenimientos([]);
      return;
    }
    let cancelado = false;
    void (async () => {
      try {
        const data = await listarMantenimientos(canchaId, accessToken);
        if (!cancelado) setMantenimientos(data);
      } catch (err) {
        if (!cancelado) {
          setMantenimientos([]);
          setError(textoError(err, "No se pudieron cargar los mantenimientos."));
        }
      }
    })();
    return () => {
      cancelado = true;
    };
  }, [accessToken, canchaId]);

  function empezarEdicion(cancha: CanchaAdmin) {
    setEditandoId(cancha.id);
    setCanchaId(cancha.id);
    setNombre(cancha.nombre);
    setTipo(cancha.tipo);
    setPrecio(String(cancha.precioHora));
    setActiva(cancha.activa);
    setError("");
    setMensaje("");
  }

  async function guardarCancha(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !sedeId) return;
    setError("");
    setMensaje("");
    const nombreLimpio = nombre.trim();
    if (!nombreLimpio) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!precioValido(precio)) {
      setError("El precio por hora tiene que ser un número mayor o igual a 0.");
      return;
    }
    const precioHora = Number(precio);
    setGuardandoCancha(true);
    try {
      if (editandoId) {
        const actualizada = await actualizarCancha(accessToken, editandoId, {
          nombre: nombreLimpio,
          precioHora,
          activa,
        });
        setCanchas((lista) =>
          lista.map((cancha) => (cancha.id === actualizada.id ? actualizada : cancha))
        );
        setMensaje("Cancha actualizada. El precio nuevo vale para reservas nuevas.");
      } else {
        const creada = await crearCancha(accessToken, {
          sedeId,
          nombre: nombreLimpio,
          tipo,
          precioHora,
        });
        setCanchas((lista) => [...lista, creada]);
        setCanchaId(creada.id);
        limpiarCancha();
        setMensaje("Cancha creada.");
      }
    } catch (err) {
      setError(textoError(err, "No se pudo guardar la cancha."));
    } finally {
      setGuardandoCancha(false);
    }
  }

  async function guardarMantenimiento(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !canchaId) return;
    setError("");
    setMensaje("");
    if (!desdeMant || !hastaMant || hastaMant <= desdeMant) {
      setError("El fin del mantenimiento tiene que ser posterior al inicio.");
      return;
    }
    setGuardandoMant(true);
    try {
      const creado = await crearMantenimiento(accessToken, canchaId, {
        desde: desdeDatetimeLocal(desdeMant),
        hasta: desdeDatetimeLocal(hastaMant),
        motivo: motivo.trim() || undefined,
      });
      setMantenimientos((lista) => [...lista, creado]);
      setDesdeMant("");
      setHastaMant("");
      setMotivo("");
      setMensaje("Mantenimiento cargado. Los turnos de ese rango quedan bloqueados.");
    } catch (err) {
      setError(textoError(err, "No se pudo cargar el mantenimiento."));
    } finally {
      setGuardandoMant(false);
    }
  }

  async function borrarMantenimiento(mantenimientoId: string) {
    if (!accessToken || !canchaId) return;
    setError("");
    setMensaje("");
    try {
      await eliminarMantenimiento(accessToken, canchaId, mantenimientoId);
      setMantenimientos((lista) =>
        lista.filter((item) => item.id !== mantenimientoId)
      );
      setMensaje("Mantenimiento eliminado.");
    } catch (err) {
      setError(textoError(err, "No se pudo eliminar el mantenimiento."));
    }
  }

  function alternarDia(dia: number) {
    setDias((actual) =>
      actual.includes(dia)
        ? actual.filter((valor) => valor !== dia)
        : [...actual, dia].sort((a, b) => a - b)
    );
  }

  async function guardarFranja(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !sedeId) return;
    setError("");
    setMensaje("");
    const recargoPct = Number(recargo);
    if (!Number.isFinite(recargoPct) || recargoPct < 0 || recargoPct > 100) {
      setError("El recargo tiene que ser un número entre 0 y 100.");
      return;
    }
    if (desdePico >= hastaPico) {
      setError("El fin del horario pico tiene que ser posterior al inicio.");
      return;
    }
    if (dias.length === 0) {
      setError("Elegí al menos un día.");
      return;
    }
    setGuardandoPico(true);
    try {
      const guardado = await guardarPico(accessToken, sedeId, {
        recargoPct,
        desde: desdePico,
        hasta: hastaPico,
        dias,
      });
      setPico(guardado);
      setMensaje("Horario pico actualizado. Vale para reservas nuevas.");
    } catch (err) {
      setError(textoError(err, "No se pudo guardar el horario pico."));
    } finally {
      setGuardandoPico(false);
    }
  }

  async function guardarCadena(event: FormEvent) {
    event.preventDefault();
    if (!accessToken || !esGerente) return;
    setError("");
    setMensaje("");
    const descuentoSocioPct = Number(descuento);
    if (
      !Number.isFinite(descuentoSocioPct) ||
      descuentoSocioPct < 0 ||
      descuentoSocioPct > 100
    ) {
      setError("El descuento tiene que ser un número entre 0 y 100.");
      return;
    }
    setGuardandoDescuento(true);
    try {
      const guardado = await guardarDescuento(accessToken, descuentoSocioPct);
      setDescuento(String(guardado.descuentoSocioPct));
      setMensaje("Descuento de socio actualizado para toda la cadena.");
    } catch (err) {
      setError(textoError(err, "No se pudo guardar el descuento."));
    } finally {
      setGuardandoDescuento(false);
    }
  }

  const canchaActual = canchas.find((cancha) => cancha.id === canchaId);

  return (
    <div className="agenda-container">
      <header className="agenda-header">
        <h1>Administrar canchas</h1>
        <p>
          Alta, precio por hora, horario pico y mantenimiento. El descuento de
          socio es de toda la cadena y lo guarda el gerente.
        </p>
      </header>

      {cargando ? (
        <p>Cargando sedes...</p>
      ) : (
        <section className="agenda-card">
          <h2>Sede</h2>
          <label className="agenda-field">
            Sede
            <select
              value={sedeId}
              onChange={(event) => {
                setSedeId(event.target.value);
                limpiarCancha();
                setCanchaId("");
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
        </section>
      )}

      {error && <p className="agenda-error">{error}</p>}
      {mensaje && <p className="agenda-ok">{mensaje}</p>}

      <section className="agenda-card">
        <h2>{editandoId ? "Editar cancha" : "Nueva cancha"}</h2>
        <form onSubmit={guardarCancha}>
          <label className="agenda-field">
            Nombre
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
            />
          </label>
          <div className="agenda-row">
            <label className="agenda-field">
              Tipo
              <select
                value={tipo}
                onChange={(event) => setTipo(event.target.value as TipoCancha)}
                disabled={editandoId !== null}
              >
                {TIPOS.map((item) => (
                  <option key={item.valor} value={item.valor}>
                    {item.etiqueta}
                  </option>
                ))}
              </select>
            </label>
            <label className="agenda-field">
              Precio por hora
              <input
                type="number"
                min="0"
                step="1"
                value={precio}
                onChange={(event) => setPrecio(event.target.value)}
              />
            </label>
          </div>
          {editandoId && (
            <label className="agenda-field">
              <span>
                <input
                  type="checkbox"
                  checked={activa}
                  onChange={(event) => setActiva(event.target.checked)}
                />{" "}
                Activa
              </span>
            </label>
          )}
          <div className="agenda-actions">
            <button className="agenda-button" type="submit" disabled={guardandoCancha}>
              {guardandoCancha ? "Guardando..." : editandoId ? "Guardar" : "Crear"}
            </button>
            {editandoId && (
              <button
                className="agenda-button agenda-button-ghost"
                type="button"
                onClick={limpiarCancha}
              >
                Nueva
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="agenda-card">
        <h2>Canchas de la sede</h2>
        {canchas.length === 0 ? (
          <p>Esta sede no tiene canchas.</p>
        ) : (
          <ul className="agenda-lista">
            {canchas.map((cancha) => (
              <li key={cancha.id}>
                <div>
                  <strong>{cancha.nombre}</strong>
                  <span>{cancha.activa ? "Activa" : "Inactiva"}</span>
                  <p>
                    {TIPOS.find((item) => item.valor === cancha.tipo)?.etiqueta} · $
                    {cancha.precioHora.toLocaleString("es-AR")} / hora
                  </p>
                </div>
                <button type="button" onClick={() => empezarEdicion(cancha)}>
                  Editar
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="agenda-card">
        <h2>Mantenimiento</h2>
        <label className="agenda-field">
          Cancha
          <select
            value={canchaId}
            onChange={(event) => setCanchaId(event.target.value)}
          >
            <option value="">Elegir cancha</option>
            {canchas.map((cancha) => (
              <option key={cancha.id} value={cancha.id}>
                {cancha.nombre}
              </option>
            ))}
          </select>
        </label>
        {canchaActual && (
          <>
            <form onSubmit={guardarMantenimiento}>
              <div className="agenda-row">
                <label className="agenda-field">
                  Desde
                  <input
                    type="datetime-local"
                    value={desdeMant}
                    onChange={(event) => setDesdeMant(event.target.value)}
                  />
                </label>
                <label className="agenda-field">
                  Hasta
                  <input
                    type="datetime-local"
                    value={hastaMant}
                    onChange={(event) => setHastaMant(event.target.value)}
                  />
                </label>
              </div>
              <label className="agenda-field">
                Motivo
                <input
                  value={motivo}
                  onChange={(event) => setMotivo(event.target.value)}
                />
              </label>
              <button className="agenda-button" type="submit" disabled={guardandoMant}>
                {guardandoMant ? "Guardando..." : "Cargar mantenimiento"}
              </button>
            </form>
            {mantenimientos.length === 0 ? (
              <p>Esta cancha no tiene mantenimientos.</p>
            ) : (
              <ul className="agenda-lista">
                {mantenimientos.map((item) => (
                  <li key={item.id}>
                    <div>
                      <strong>
                        {formatearHorario(item.desde)} – {formatearHorario(item.hasta)}
                      </strong>
                      {item.motivo && <p>{item.motivo}</p>}
                    </div>
                    <button type="button" onClick={() => borrarMantenimiento(item.id)}>
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="agenda-card">
        <h2>Horario pico</h2>
        {pico && (
          <form onSubmit={guardarFranja}>
            <label className="agenda-field">
              Recargo (%)
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={recargo}
                onChange={(event) => setRecargo(event.target.value)}
              />
            </label>
            <div className="agenda-row">
              <label className="agenda-field">
                Desde
                <select
                  value={desdePico}
                  onChange={(event) => setDesdePico(event.target.value)}
                >
                  {HORAS.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </label>
              <label className="agenda-field">
                Hasta
                <select
                  value={hastaPico}
                  onChange={(event) => setHastaPico(event.target.value)}
                >
                  {HORAS.map((hora) => (
                    <option key={hora} value={hora}>
                      {hora}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset className="agenda-field">
              <legend>Días</legend>
              {DIAS.map((dia) => (
                <label key={dia.valor}>
                  <input
                    type="checkbox"
                    checked={dias.includes(dia.valor)}
                    onChange={() => alternarDia(dia.valor)}
                  />{" "}
                  {dia.etiqueta}
                </label>
              ))}
            </fieldset>
            <button className="agenda-button" type="submit" disabled={guardandoPico}>
              {guardandoPico ? "Guardando..." : "Guardar pico"}
            </button>
          </form>
        )}
      </section>

      <section className="agenda-card">
        <h2>Descuento de socio</h2>
        <p>Porcentaje único de la cadena: {descuento} %.</p>
        {esGerente ? (
          <form onSubmit={guardarCadena}>
            <label className="agenda-field">
              Descuento (%)
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={descuento}
                onChange={(event) => setDescuento(event.target.value)}
              />
            </label>
            <button
              className="agenda-button"
              type="submit"
              disabled={guardandoDescuento}
            >
              {guardandoDescuento ? "Guardando..." : "Guardar descuento"}
            </button>
          </form>
        ) : (
          <p>Solo el gerente puede cambiar este valor.</p>
        )}
      </section>
    </div>
  );
}

export default GestionarCanchas;
