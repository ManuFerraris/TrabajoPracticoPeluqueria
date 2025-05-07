import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.tsx";

export default function ProtectedRoute(){
    const auth= useAuth();
    
    //Chequeamos si el usuario esta autenticado, si no lo redirigimos a la pagina de login.
    if (!auth.isAuthenticated) {
        return <Navigate to="/" replace />;
    };
    
    return <Outlet />;
}