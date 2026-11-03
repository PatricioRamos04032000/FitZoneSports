import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

type RoleRouteProps = {
  allowedRoles: string[];
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
