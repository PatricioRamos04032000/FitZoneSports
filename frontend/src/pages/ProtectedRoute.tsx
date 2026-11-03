import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    console.log("Estado de autenticación:", isAuthenticated);
    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/login" replace />;
}

export default ProtectedRoute;