import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.tsx";

export default function ProtectedRoute() {
    const auth = useAuth();
    const [isValidating, setIsValidating] = useState<boolean>(true);
    const [isSessionValid, setIsSessionValid] = useState<boolean>(false);

    useEffect(()=> {
        const token = localStorage.getItem("accessToken");
        const rawUser = localStorage.getItem("user");
        
        if(!token || !rawUser){
            setIsSessionValid(false);
            setIsValidating(false);
            return;
        };

        try{
            const parsedUser = JSON.parse(rawUser);
            if(!auth.isAuthenticated || !parsedUser){
                console.warn("Sesion invalida. Redirigiendo...");
                setIsSessionValid(false);
            };
        }catch(error:any){
            console.error("Error al parsear user: ", error);
            localStorage.removeItem("user");
            setIsSessionValid(false);
        }finally {
            setIsValidating(false);
        };
    }, [auth.isAuthenticated]);

    if(isValidating){
        return <div>Cargando sesión...</div>;
    };

    if (!isSessionValid) {
        return <Navigate to="/login" replace />;
    };

    return <Outlet />;
};