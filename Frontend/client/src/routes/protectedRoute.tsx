import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.tsx";

type ProtectedRouteProps = {
    children?: React.ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, logout } = useAuth();

    if(isLoading){
        return <div>Cargando sesión...</div>;
    };

    if (!isAuthenticated) {
        console.warn("Sesión inválida. Redirigiendo...");
        logout();
        return <Navigate to="/login" replace />;
    };

    return <>{children ?? <Outlet />}</>
    };