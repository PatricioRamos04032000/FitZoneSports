import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { Button, Input, Spinner } from "../../components/atoms";
import { apiRequest } from "../../services/api";
import "./Login.css";

function Login() {
    const [email, setEmail] = useState("");
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    const auth = useAuth();

    if (auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setError("");
        setCargando(true);

        try {
            const data = await apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password: clave,
                }),
            });

            auth.login(data.access_token);

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "No se pudo iniciar sesión."
            );
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">

                <h1>FITZONE <span>SPORTS</span></h1>
                <h2>Iniciar sesión</h2>
                <p>Ingresá tus datos para continuar.</p>

                <form onSubmit={handleSubmit}>

                    <Input
                        id="email"
                        label="Email"
                        type="email"
                        placeholder="Ingresá tu email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <Input
                        id="clave"
                        label="Contraseña"
                        type="password"
                        placeholder="Ingresá tu contraseña"
                        value={clave}
                        onChange={(event) => setClave(event.target.value)}
                        required
                    />

                    {error && <p className="login-error">{error}</p>}

                    <Button type="submit" disabled={cargando} aria-busy={cargando}>
                        {cargando && <Spinner label="Ingresando" />}
                        {cargando ? "Ingresando..." : "Ingresar"}
                    </Button>

                </form>

                <p className="login-signup">
                    ¿No tenés una cuenta? <Link to="/signup">Registrate</Link>
                </p>

                <Link to="/" className="login-back">
                    Volver al inicio
                </Link>

            </div>
        </div>
    );
}

export default Login;