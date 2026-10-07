import { Outlet, Link } from "react-router-dom";

function Layout() {
  return (
    <div>
      <header>
        <h1>FitZone Sports</h1>
      </header>

      <nav>
        <Link to="/">Inicio</Link>
      </nav>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;