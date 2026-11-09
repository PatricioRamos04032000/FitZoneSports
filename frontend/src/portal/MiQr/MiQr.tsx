import { useCallback, useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { useAuth } from "../../store/useAuth";
import { apiRequest, ApiError } from "../../services/api";
import "./MiQr.css";

type TotpCodigoResponse = {
  code: string;
  periodSeconds: number;
  secondsRemaining: number;
};

function MiQr() {
  const { accessToken, user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [code, setCode] = useState("");
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  const pintarQr = useCallback(
    async (payload: string) => {
      if (!canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, payload, {
        width: 240,
        margin: 2,
        color: { dark: "#14283f", light: "#ffffff" },
      });
    },
    []
  );

  const cargarCodigo = useCallback(async () => {
    if (!accessToken || !user?.id) return;

    try {
      const data = (await apiRequest("/acceso/totp/me/codigo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })) as TotpCodigoResponse;

      setCode(data.code);
      setSecondsRemaining(data.secondsRemaining);
      setError("");

      const payload = JSON.stringify({
        v: 1,
        perfilId: user.id,
        code: data.code,
      });
      await pintarQr(payload);
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "No se pudo cargar el código TOTP.";
      setError(msg);
    } finally {
      setCargando(false);
    }
  }, [accessToken, user?.id, pintarQr]);

  useEffect(() => {
    void cargarCodigo();
  }, [cargarCodigo]);

  useEffect(() => {
    if (!accessToken || !user?.id) return;

    const id = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          void cargarCodigo();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [accessToken, user?.id, cargarCodigo]);

  return (
    <div className="miqr-container">
      <header className="miqr-header">
        <h1>Mi QR</h1>
        <p>
          Mostrá este código en recepción. Se regenera cada minuto (TOTP).
        </p>
      </header>

      <section className="miqr-card">
        {cargando && !code && !error && (
          <p className="miqr-loading">Generando código…</p>
        )}

        {error && <p className="miqr-error">{error}</p>}

        {!error && (
          <>
            <div className="miqr-canvas-wrap">
              <canvas ref={canvasRef} width={240} height={240} />
            </div>
            {code && (
              <>
                <p className="miqr-code">{code}</p>
                <p className="miqr-meta">
                  Renueva en {secondsRemaining}s · período 60s
                </p>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default MiQr;
