import { useEffect, useState } from "react";
import "./Canchas.css";
import {
  obtenerSedes,
  obtenerDisponibilidad,
  obtenerMisReservas,
  reservarCancha,
  cancelarReserva,
  iniciarPago,
  type Sede,
  type DisponibilidadSede,
  type Reserva,
} from "../../services/canchas";
import { descargarComprobanteReserva } from "../../services/pagos";

import { Select } from "../../components/atoms";
import { Alerta } from "../../components/molecules";
import { formatearHorario } from "../../horario";
import { useAuth } from "../../store/useAuth";

// Obtener la fecha actual
function obtenerFechaActual() {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
}

function Canchas() {
  // Autenticación
  const { accessToken } = useAuth();

  // Estados de sedes y disponibilidad
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState("");
  const [fecha, setFecha] = useState(obtenerFechaActual());
  const [horarioSeleccionado, setHorarioSeleccionado] = useState("");

  const [disponibilidad, setDisponibilidad] =
    useState<DisponibilidadSede | null>(null);

  // Estados de carga y errores
  const [cargandoSedes, setCargandoSedes] = useState(true);
  const [cargandoCanchas, setCargandoCanchas] = useState(false);
  const [error, setError] = useState("");

  // Estados de reserva
  const [reservando, setReservando] = useState(false);
  const [reservaCreada, setReservaCreada] =
    useState<Reserva | null>(null);
  const [misReservas, setMisReservas] = useState<Reserva[]>([]);
  const [errorReserva, setErrorReserva] = useState("");
  const [errorMisReservas, setErrorMisReservas] = useState("");
  const [nombresCancha, setNombresCancha] = useState<
    Record<string, string>
  >({});

  // Estado de pago
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [cancelandoId, setCancelandoId] = useState("");
  const [descargandoComprobanteId, setDescargandoComprobanteId] = useState("");

  // Cargar sedes
  useEffect(() => {
    async function cargarSedes() {
      try {
        setCargandoSedes(true);
        setError("");

        const respuesta = await obtenerSedes();
        const sedesActivas = respuesta.filter(
          (sede) => sede.activa
        );

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

  // Cargar disponibilidad cuando cambia la sede o la fecha
  useEffect(() => {
    if (!sedeSeleccionada || !fecha) {
      return;
    }

    async function cargarDisponibilidad() {
      try {
        setCargandoCanchas(true);
        setError("");
        setHorarioSeleccionado("");

        const respuesta = await obtenerDisponibilidad(
          sedeSeleccionada,
          fecha
        );

        setDisponibilidad(respuesta);
        setNombresCancha((prev) => {
          const next = { ...prev };
          for (const cancha of respuesta.canchas) {
            next[cancha.id] = cancha.nombre;
          }
          return next;
        });
      } catch (err) {
        setDisponibilidad(null);
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo consultar la disponibilidad."
        );
      } finally {
        setCargandoCanchas(false);
      }
    }

    cargarDisponibilidad();
  }, [sedeSeleccionada, fecha]);

  // Cargar las reservas del usuario autenticado
  // y actualizar cuando vuelve de la pasarela de pago
  useEffect(() => {
    if (!accessToken) return;

    const token = accessToken;
    let activo = true;

    async function cargarMisReservas() {
      try {
        const reservas = await obtenerMisReservas(token);

        if (activo) {
          setMisReservas(reservas);
          setErrorMisReservas("");
        }
      } catch (err) {
        if (activo) {
          setErrorMisReservas(
            err instanceof Error
              ? err.message
              : "No se pudieron actualizar tus reservas."
          );
        }
      }
    }

    cargarMisReservas();

    window.addEventListener("focus", cargarMisReservas);
    window.addEventListener("pageshow", cargarMisReservas);

    return () => {
      activo = false;
      window.removeEventListener("focus", cargarMisReservas);
      window.removeEventListener("pageshow", cargarMisReservas);
    };
  }, [accessToken]);

  // Obtener los horarios disponibles en la grilla
  const horarios = [
    ...new Set(
      disponibilidad?.canchas.flatMap((cancha) =>
        cancha.turnos.map((turno) => turno.hora)
      ) ?? []
    ),
  ].sort();

  // Obtener sede seleccionada
  const sedeActual = sedes.find(
    (sede) => sede.id === sedeSeleccionada
  );

  // Mostrar la versión más actualizada de la reserva
  const reservaMostrada = reservaCreada
    ? misReservas.find(
        (reserva) => reserva.id === reservaCreada.id
      ) ?? reservaCreada
    : null;

  function nombreCancha(canchaId: string): string {
    return (
      nombresCancha[canchaId] ||
      disponibilidad?.canchas.find((c) => c.id === canchaId)
        ?.nombre ||
      "Cancha"
    );
  }

  // Crear una reserva
  async function handleReservar(
    canchaId: string,
    inicio: string
  ) {
    if (!accessToken) {
      setErrorReserva(
        "Tu sesión expiró. Volvé a iniciar sesión."
      );
      return;
    }

    try {
      setReservando(true);
      setErrorReserva("");
      setReservaCreada(null);

      const reserva = await reservarCancha(
        canchaId,
        inicio,
        accessToken
      );

      setReservaCreada(reserva);

      setMisReservas((reservas) => [
        reserva,
        ...reservas.filter((r) => r.id !== reserva.id),
      ]);
    } catch (err) {
      setErrorReserva(
        err instanceof Error
          ? err.message
          : "No se pudo realizar la reserva."
      );
    } finally {
      setReservando(false);
    }
  }

  async function recargarDisponibilidad() {
    if (!sedeSeleccionada || !fecha) return;
    try {
      const respuesta = await obtenerDisponibilidad(
        sedeSeleccionada,
        fecha
      );
      setDisponibilidad(respuesta);
    } catch {
      // La grilla se vuelve a pedir al cambiar sede o fecha.
    }
  }

  async function handleCancelar(reservaId: string) {
    if (!accessToken) {
      setErrorReserva(
        "Tu sesión expiró. Volvé a iniciar sesión."
      );
      return;
    }

    try {
      setCancelandoId(reservaId);
      setErrorReserva("");

      const reserva = await cancelarReserva(
        reservaId,
        accessToken
      );

      setMisReservas((reservas) =>
        reservas.map((item) =>
          item.id === reserva.id ? reserva : item
        )
      );
      setReservaCreada((actual) =>
        actual?.id === reserva.id ? reserva : actual
      );
      await recargarDisponibilidad();
    } catch (err) {
      setErrorReserva(
        err instanceof Error
          ? err.message
          : "No se pudo cancelar la reserva."
      );
    } finally {
      setCancelandoId("");
    }
  }

  async function handleDescargarComprobante(reservaId: string) {
    if (!accessToken) {
      setErrorReserva(
        "Tu sesión expiró. Volvé a iniciar sesión."
      );
      return;
    }

    try {
      setDescargandoComprobanteId(reservaId);
      setErrorReserva("");
      await descargarComprobanteReserva(reservaId, accessToken);
    } catch (err) {
      setErrorReserva(
        err instanceof Error
          ? err.message
          : "No se pudo descargar el comprobante."
      );
    } finally {
      setDescargandoComprobanteId("");
    }
  }

  // Iniciar el pago de una reserva
  async function handlePagar(reservaId: string) {
    if (!accessToken) {
      setErrorReserva(
        "Tu sesión expiró. Volvé a iniciar sesión."
      );
      return;
    }

    try {
      setProcesandoPago(true);
      setErrorReserva("");

      const pago = await iniciarPago(
        reservaId,
        accessToken
      );

      // Redirigir al checkout simulado
      window.location.href = pago.checkoutUrl;
    } catch (err) {
      setErrorReserva(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar el pago."
      );
      setProcesandoPago(false);
    }
  }

  return (
    <div className="canchas-container">
      <h1>Canchas</h1>

      {/* Selección de sede */}
      <h2>Seleccionar sede</h2>

      {cargandoSedes ? (
        <p>Cargando sedes...</p>
      ) : (
        <Select
          id="sede"
          label="Sede"
          value={sedeSeleccionada}
          onChange={(e) =>
            setSedeSeleccionada(e.target.value)
          }
        >
          <option value="">Seleccionar sede</option>

          {sedes.map((sede) => (
            <option key={sede.id} value={sede.id}>
              {sede.nombre}
            </option>
          ))}
        </Select>
      )}

      {sedeActual && (
        <p>{sedeActual.direccion}</p>
      )}

      {/* Selección de fecha */}
      <h2>Seleccionar fecha</h2>

      <input
        type="date"
        value={fecha}
        min={obtenerFechaActual()}
        onChange={(e) => setFecha(e.target.value)}
      />

      {/* Selección de horario */}
      <h2>Seleccionar horario</h2>

      <Select
        id="horario"
        label="Horario"
        value={horarioSeleccionado}
        onChange={(e) =>
          setHorarioSeleccionado(e.target.value)
        }
        disabled={!disponibilidad || cargandoCanchas}
      >
        <option value="">Seleccionar horario</option>

        {horarios.map((hora) => (
          <option key={hora} value={hora}>
            {hora}
          </option>
        ))}
      </Select>

      {/* Listado de canchas */}
      <h2>Canchas</h2>

      {error && <Alerta>{error}</Alerta>}

      {cargandoCanchas && (
        <p>Consultando disponibilidad...</p>
      )}

      {!cargandoSedes && sedes.length === 0 && (
        <p>No hay sedes activas disponibles.</p>
      )}

      {!cargandoCanchas &&
        disponibilidad &&
        disponibilidad.canchas.length === 0 && (
          <p>No hay canchas disponibles para esta sede.</p>
        )}

      {!cargandoCanchas &&
        disponibilidad &&
        disponibilidad.canchas.map((cancha) => {
          const turno = cancha.turnos.find(
            (t) => t.hora === horarioSeleccionado
          );

          return (
            <div
              key={cancha.id}
              className="cancha-card"
            >
              <h3>{cancha.nombre}</h3>

              <p>Tipo: {cancha.tipo}</p>

              {turno ? (
                <>
                  <p>Estado: {turno.estado}</p>

                  <p>
                    Precio socio: $
                    {turno.precioSocio.toLocaleString("es-AR")}
                  </p>

                  <p>
                    Precio externo: $
                    {turno.precioExterno.toLocaleString("es-AR")}
                  </p>

                  {turno.esHorarioPico && (
                    <p>Horario pico</p>
                  )}

                  {turno.estado === "disponible" && (
                    <button
                      onClick={() =>
                        handleReservar(
                          cancha.id,
                          turno.inicio
                        )
                      }
                      disabled={reservando || procesandoPago}
                    >
                      {reservando
                        ? "Reservando..."
                        : "Reservar"}
                    </button>
                  )}
                </>
              ) : (
                <p>
                  {horarioSeleccionado
                    ? "No hay información para este horario."
                    : "Seleccioná un horario para consultar su disponibilidad."}
                </p>
              )}
            </div>
          );
        })}

      {/* Resultado de la reserva */}
      {errorMisReservas && <Alerta>{errorMisReservas}</Alerta>}

      {errorReserva && <Alerta>{errorReserva}</Alerta>}

      {reservaMostrada && (
        <div className="reserva-confirmacion">
          <h3>
            {reservaMostrada.estado === "confirmada"
              ? "¡Reserva confirmada!"
              : reservaMostrada.estado === "cancelada"
                ? "Reserva cancelada"
                : "¡Reserva creada correctamente!"}
          </h3>

          <p>
            Cancha: {nombreCancha(reservaMostrada.canchaId)}
          </p>

          <p>
            Precio: $
            {reservaMostrada.precio.toLocaleString("es-AR")}
          </p>

          <p>
            Estado: {reservaMostrada.estado}
          </p>

          {/* Botón para iniciar el pago */}
          {reservaMostrada.estado === "pendiente" && (
            <button
              onClick={() => handlePagar(reservaMostrada.id)}
              disabled={procesandoPago || cancelandoId !== ""}
            >
              {procesandoPago
                ? "Conectando con la pasarela..."
                : "Pagar reserva"}
            </button>
          )}

          {reservaMostrada.estado === "confirmada" && (
            <button
              onClick={() => handleDescargarComprobante(reservaMostrada.id)}
              disabled={descargandoComprobanteId === reservaMostrada.id}
            >
              {descargandoComprobanteId === reservaMostrada.id
                ? "Descargando PDF..."
                : "Descargar comprobante PDF"}
            </button>
          )}

          {(reservaMostrada.estado === "pendiente" ||
            reservaMostrada.estado === "confirmada") && (
            <button
              onClick={() => handleCancelar(reservaMostrada.id)}
              disabled={
                procesandoPago || cancelandoId === reservaMostrada.id
              }
            >
              {cancelandoId === reservaMostrada.id
                ? "Cancelando..."
                : "Cancelar reserva"}
            </button>
          )}

          {reservaMostrada.estado === "cancelada" && (
            <p>La reserva quedó cancelada.</p>
          )}
        </div>
      )}

      {accessToken && misReservas.length > 0 && (
        <section>
          <h2>Mis reservas</h2>
          <ul className="mis-reservas">
            {misReservas.map((reserva) => (
              <li key={reserva.id}>
                <p>
                  {nombreCancha(reserva.canchaId)} ·{" "}
                  {formatearHorario(reserva.inicio)} · {reserva.estado}
                </p>
                <div className="mis-reservas-acciones">
                  {reserva.estado === "confirmada" && (
                    <button
                      onClick={() => handleDescargarComprobante(reserva.id)}
                      disabled={descargandoComprobanteId === reserva.id}
                    >
                      {descargandoComprobanteId === reserva.id
                        ? "Descargando..."
                        : "Comprobante PDF"}
                    </button>
                  )}
                  {(reserva.estado === "pendiente" ||
                    reserva.estado === "confirmada") && (
                    <button
                      onClick={() => handleCancelar(reserva.id)}
                      disabled={
                        procesandoPago || cancelandoId === reserva.id
                      }
                    >
                      {cancelandoId === reserva.id
                        ? "Cancelando..."
                        : "Cancelar"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default Canchas;
