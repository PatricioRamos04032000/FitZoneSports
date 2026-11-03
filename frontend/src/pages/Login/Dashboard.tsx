
import { useAuth } from "../../auth/useAuth";

function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>🏋️ DASHBOARD FITZONE</h1>
      <p>Estás en el Dashboard</p>

      <h2>Datos del usuario</h2>

      {user ? (
        <div>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Rol de Supabase:</strong> {user.role}</p>
          <p><strong>Rol de FitZone:</strong> {user.rol ?? "Sin rol asignado"}</p>
        </div>
      ) : (
        <p>No se encontraron datos del usuario.</p>
      )}

      <button onClick={logout}>Cerrar sesión</button>
    </div>
  );
}

export default Dashboard;
