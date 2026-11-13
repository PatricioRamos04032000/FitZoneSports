import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../store/useAuth";
import type { RolUsuario } from "../store/rol";

type RoleRouteProps = {
  allowedRoles: RolUsuario[];
};

function fallbackPorRol(rol: RolUsuario | null | undefined): string {
  if (rol === "socio" || rol === "externo") {
    return "/perfil";
  }
  return "/";
}

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
    return <Navigate to={fallbackPorRol(rol)} replace />;
  }

  return <Outlet />;
}

export default RoleRoute;
