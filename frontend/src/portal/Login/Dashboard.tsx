import { useEffect, useState } from "react";
import { useAuth } from "../../store/useAuth";
import {
  obtenerResumen,
  type ResumenReporte,
} from "../../services/reportes";
import "./Dashboard.css";

function fechaVisible(fecha: string) {
  const [anio, mes, dia] = fecha.slice(0, 10).split("-");
  if (!anio || !mes || !dia) return fecha;
  return `${dia}/${mes}/${anio}`;
}

function Dashboard() {
  const { accessToken } = useAuth();
  const [resumen, setResumen] = useState<ResumenReporte | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) return;

    let cancelado = false;
    void (async () => {
      try {
        const data = await obtenerResumen(accessToken);
        if (!cancelado) setResumen(data);
      } catch (err) {
        if (!cancelado) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo cargar el resumen."
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

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>
          {resumen
            ? `Cifras de la cadena del ${fechaVisible(resumen.fecha)}. La ocupación es quién está adentro ahora.`
            : "Cifras de la cadena. La ocupación es quién está adentro ahora."}
        </p>
      </header>

      {cargando && <p>Cargando el resumen…</p>}
      {error && <p className="dashboard-error">{error}</p>}

      {resumen && (
        <>
          <section className="dashboard-cadena" aria-label="Total de la cadena">
            <div className="dashboard-cifra">
              <span>Ocupación</span>
              <strong>
                {resumen.cadena.ocupacion} / {resumen.cadena.aforo_max}
              </strong>
            </div>
            <div className="dashboard-cifra">
              <span>Reservas del día</span>
              <strong>{resumen.cadena.reservas_del_dia}</strong>
            </div>
            <div className="dashboard-cifra">
              <span>Clases del día</span>
              <strong>{resumen.cadena.clases_del_dia}</strong>
            </div>
            <div className="dashboard-cifra">
              <span>Sedes</span>
              <strong>{resumen.sedes.length}</strong>
            </div>
          </section>

          <section className="dashboard-card">
            <h2>Por sede</h2>
            {resumen.sedes.length === 0 ? (
              <p>No hay sedes cargadas.</p>
            ) : (
              <table className="dashboard-tabla">
                <thead>
                  <tr>
                    <th>Sede</th>
                    <th className="num">Ocupación</th>
                    <th className="num">Reservas del día</th>
                    <th className="num">Clases del día</th>
                  </tr>
                </thead>
                <tbody>
                  {resumen.sedes.map((sede) => (
                    <tr key={sede.id}>
                      <td>
                        {sede.nombre}
                        {!sede.activa && (
                          <span className="dashboard-inactiva">Inactiva</span>
                        )}
                      </td>
                      <td className="num">
                        {sede.ocupacion} / {sede.aforo_max}
                      </td>
                      <td className="num">{sede.reservas_del_dia}</td>
                      <td className="num">{sede.clases_del_dia}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
