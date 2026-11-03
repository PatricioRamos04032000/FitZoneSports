
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import "./Layout.css";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function cerrarSesion() {
    logout();
    navigate("/login");
  }

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

        {user ? (
          <button
            className="navbar-login"
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        ) : (
          <Link to="/login" className="navbar-login">
            Iniciar sesión
          </Link>
        )}
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
