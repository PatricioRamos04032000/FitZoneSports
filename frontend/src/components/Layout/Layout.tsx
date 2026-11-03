import { Link, Outlet } from "react-router-dom";
import "./Layout.css";

function Layout() {
    return (
        <div className="layout">

            <nav className="navbar">
                <Link to="/" className="navbar-logo">
                    FITZONE <span>SPORTS</span>
                </Link>

                <div className="navbar-links">
                    <Link to="/">Inicio</Link>
                    <Link to="/canchas">Canchas</Link>
                    <Link to="/perfil">Mi Perfil</Link>
                    <Link to="/dashboard">Dashboard</Link>
                </div>

                <Link to="/login" className="navbar-login">
                    Iniciar sesión
                </Link>
            </nav>

            <main className="layout-content">
                <Outlet />
            </main>

            <footer className="footer">
                <p>© 2026 FitZone Sports - Todos los derechos reservados.</p>
            </footer>

        </div>
    );
}

export default Layout;
