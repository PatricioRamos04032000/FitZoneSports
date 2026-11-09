import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
    return (
        <div className="home-container">
            <h1 className="home-title">Bienvenido a FitZone Sports</h1>
            <p>Seleccioná una sección para continuar.</p>

            <div className="home-links">
                <Link to="/dashboard">
                    <button>Dashboard</button>
                </Link>

                <Link to="/perfil">
                    <button>Mi Perfil</button>
                </Link>

                <Link to="/canchas">
                    <button>Canchas</button>
                </Link>

                <Link to="/login">
                    <button>Iniciar sesión</button>
                </Link>

                <Link to="/signup">
                    <button>Registrarse</button>
                </Link>
            </div>
        </div>
    );
}

export default Home;
