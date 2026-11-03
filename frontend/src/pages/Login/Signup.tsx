import { useAuth } from "../../auth/useAuth";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "./Signup.css";

function Signup() {
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");
    const auth = useAuth();

    if (auth.isAuthenticated)  {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="signup-container">
            <div className="signup-card">

                <h1>FITZONE <span>SPORTS</span></h1>
                <h2>Crear una cuenta</h2>
                <p>Completá tus datos para registrarte.</p>

                <form>
                    <label>Nombre completo</label>
                    <input
                        type="text"
                        placeholder="Ingresá tu nombre"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                    />

                    <label>Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label>Contraseña</label>
                    <input
                        type="password"
                        placeholder="Ingresá tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <label>Confirmar contraseña</label>
                    <input
                        type="password"
                        placeholder="Repetí tu contraseña"
                        value={confirmarPassword}
                        onChange={(e) => setConfirmarPassword(e.target.value)}
                    />

                    <button type="submit">Registrarse</button>
                </form>

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
