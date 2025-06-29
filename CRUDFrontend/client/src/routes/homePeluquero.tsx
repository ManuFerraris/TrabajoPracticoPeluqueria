import React from 'react';
import { useNavigate, Navigate  } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomePeluquero() {
    const navigate = useNavigate();
    const auth = useAuth();
    // Se utilizará auth.user para consistencia, ya que viene del estado del contexto.
    const user = auth.user; 
    
    useEffect(() => {
        const checkAuth = async () => {
            if(!auth.isAuthenticated) return; //Si no esta autenticado no intenta renovar sesion.
        
            const refreshed = await auth.refreshAuth(); //Intenta renovar el token;
            if(!refreshed) {
                console.warn("Sesion expirada, cerrando sesión...");
                auth.logout();
                navigate("/login", { replace: true });
            }
        };
        checkAuth();
    },[auth, navigate]);


    if (!auth.isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    };
    

    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        sessionStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        try{
            auth.logout(); //Espera respuesta antes de redirigir
            navigate('/login', { replace: true });
        } catch(error){
            console.error("Error en el logout:", error);
        };
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold text-primary">
                    {user.rol === 'admin' ? 'Panel de Administrador' : `Bienvenido, ${user.nombre}`}
                </h1>
                <p className="text-muted fs-5">
                    {user.rol === 'admin' ? 'Gestión completa del sistema' : '¿Cortamos hoy?'}
                </p>
            </div>
    
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card text-white bg-primary mb-3 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Turnos activos</h5>
                            <p className="card-text display-6">12</p> 
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-success mb-3 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Turnos hoy</h5>
                            <p className="card-text display-6">5</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-white bg-secondary mb-3 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Estado</h5>
                            <p className="card-text fs-5">Operativo</p>
                        </div>
                    </div>
                </div>
            </div>
    
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h4 className="text-center mb-4">Acciones Rápidas</h4>
                            <div className="d-grid gap-3">

                                <button onClick={() => navigate("/listado-turnos")} className="btn btn-primary btn-lg py-3">
                                    Ver mis Turnos
                                </button>

                                <button onClick={() => navigate("/historial-peluquero")} className="btn btn-outline-primary btn-lg py-3">
                                    Historial de Peluquero
                                </button>

                                <button onClick={() => navigate("/historial-cliente")} className="btn btn-outline-primary btn-lg py-3">
                                    Historial de Cliente
                                </button>

                                <button onClick={() => navigate("/editar-perfil")} className="btn btn-outline-secondary btn-lg py-3">
                                    Editar Perfil
                                </button>

                                {/*Este boton solo se muestra al admin*/}
                                {user.rol === 'admin' && (
                                    <button onClick={() => navigate("/peluquero")} className="btn btn-outline-primary btn-lg py-3">
                                        Informacion de peluqueros
                                    </button>
                                )}

                                <button onClick={() => navigate("/baja-turno")} className="btn btn-outline-warning btn-lg py-3">
                                    Cancelar Turno
                                </button>

                                <button onClick={handleLogout} className="btn btn-danger btn-lg py-3 mt-4">
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}