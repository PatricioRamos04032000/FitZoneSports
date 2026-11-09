import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import type { RolUsuario } from "../store/rol";

type RoleRouteProps = {
  allowedRoles: RolUsuario[];
};

function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <p>Verificando sesión...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const rol = user?.rol;
  if (!rol || !allowedRoles.includes(rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
