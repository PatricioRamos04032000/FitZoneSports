import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../store/useAuth";
import "./Layout.css";

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  function cerrarSesion() {
    logout();
    navigate("/login");
  }

  const rol = user?.rol;
  const esStaff = rol === "admin_sede" || rol === "gerente";
  const enLogin = pathname === "/login";

  return (
    <div className="layout">
      <nav className="navbar">
        <Link to={user ? "/" : "/login"} className="navbar-logo">
          FITZONE <span>SPORTS</span>
        </Link>

        <div className="navbar-links">
          {user && (
            <>
              <Link to="/">Inicio</Link>
              <Link to="/canchas">Canchas</Link>
              <Link to="/clases">Clases</Link>
              <Link to="/notificaciones">Notificaciones</Link>
              <Link to="/perfil">Mi Perfil</Link>
              {esStaff && <Link to="/dashboard">Dashboard</Link>}
              {rol === "socio" && <Link to="/mi-qr">Mi QR</Link>}
              {esStaff && <Link to="/acceso">Acceso</Link>}
            </>
          )}
        </div>

        {user ? (
          <button className="navbar-login" onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        ) : (
          !enLogin && (
            <Link to="/login" className="navbar-login">
              Iniciar sesión
            </Link>
          )
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
