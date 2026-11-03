
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { apiRequest } from "../../services/api";
import "./Signup.css";

function Signup() {
  const auth = useAuth();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  if (auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  function limpiarFormulario() {
    setNombre("");
    setApellido("");
    setDni("");
    setTelefono("");
    setEmail("");
    setPassword("");
    setConfirmarPassword("");
    setError("");
    setMensaje("");
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setMensaje("");

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setCargando(true);

    try {
      const data = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          nombre,
          apellido,
          dni,
          telefono,
          email,
          password,
        }),
      });

      setMensaje(
        data.message || "Registro exitoso. Revisá tu correo electrónico."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar el registro."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>
          FITZONE <span>SPORTS</span>
        </h1>

        <h2>Crear una cuenta</h2>
        <p>Completá tus datos para registrarte.</p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="signup-nombre">Nombre</label>
          <input
            id="signup-nombre"
            type="text"
            placeholder="Ingresá tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label htmlFor="signup-apellido">Apellido</label>
          <input
            id="signup-apellido"
            type="text"
            placeholder="Ingresá tu apellido"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
          />

          <label htmlFor="signup-dni">DNI</label>
          <input
            id="signup-dni"
            type="text"
            placeholder="Ingresá tu DNI"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            required
          />

          <label htmlFor="signup-telefono">Teléfono</label>
          <input
            id="signup-telefono"
            type="tel"
            placeholder="Ingresá tu teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <label htmlFor="signup-email">Correo electrónico</label>
          <input
            id="signup-email"
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="signup-password">Contraseña</label>
          <input
            id="signup-password"
            type="password"
            placeholder="Ingresá tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="signup-confirmar">Confirmar contraseña</label>
          <input
            id="signup-confirmar"
            type="password"
            placeholder="Repetí tu contraseña"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={cargando || mensaje !== ""}>
            {cargando ? "Registrando..." : "Registrarse"}
          </button>
        </form>

        {error && <p className="signup-error">{error}</p>}

        {mensaje && (
          <div className="signup-success">
            <p>{mensaje}</p>
            <button type="button" onClick={limpiarFormulario}>
              Registrar otra cuenta
            </button>
          </div>
        )}

        <p className="signup-login">
          ¿Ya tenés una cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>

        <Link to="/" className="signup-back">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default Signup;
