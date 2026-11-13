import { Navigate } from "react-router-dom";
import { useAuth } from "../../store/useAuth";
import "./Home.css";

function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Verificando sesión...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="home-container">
      <h1 className="home-title">Bienvenido a FitZone Sports</h1>
      <p>Elegí una sección del menú para continuar.</p>
    </div>
  );
}

export default Home;
