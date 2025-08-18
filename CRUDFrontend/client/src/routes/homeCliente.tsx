import React, {useEffect} from 'react';
import { useNavigate  } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomeCliente() {
    const navigate = useNavigate();
    const auth = useAuth();

    const rawUser = localStorage.getItem("user");
    let user = null;

    try {
        user = rawUser ? JSON.parse(rawUser) : null;
    } catch (error) {
        console.error("Error al parsear userData:", error);
        localStorage.removeItem("user");
    };

    useEffect(() => {
        if (!auth.isAuthenticated || !auth.user) {
            console.warn("Redirigiendo a login...");
            navigate("/login", { replace: true });
        }
    }, [auth.isAuthenticated, auth.user, navigate]);

    const handleLogout = () => {
        console.log("Cerrando sesión...");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        sessionStorage.removeItem("accessToken");
        try{
            auth.logout();
            navigate('/login', { replace: true });
        }catch (error){
            console.error("Error en el logout:", error);
        };
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <div className="text-center mb-4">
                                <h1 className="h3 fw-bold text-primary">Bienvenido, {user.nombre}</h1>
                                <p className="text-muted">¿Qué te gustaría hacer hoy?</p>
                            </div>

                            <div className="d-grid gap-3">
                                <button 
                                    onClick={() => navigate("/clientes/sacar-turno")} 
                                    className="btn btn-primary btn-lg py-3"
                                >
                                    <i className="bi bi-calendar-plus me-2"></i>
                                    Sacar Turno
                                </button>
                                
                                <button onClick={() => navigate("/clientes/historial-cliente")} className="btn btn-outline-primary btn-lg py-3">
                                    <i className="bi bi-list-check me-2"></i>
                                    Historial de Cliente
                                </button>
                                
                                <button 
                                    onClick={() => navigate("/clientes/editar-perfil-cliente")} 
                                    className="btn btn-outline-secondary btn-lg py-3"
                                >
                                    <i className="bi bi-person-gear me-2"></i>
                                    Editar Perfil
                                </button>
                                
                                <button 
                                    onClick={() => navigate("/clientes/baja-turno")} 
                                    className="btn btn-outline-warning btn-lg py-3"
                                >
                                    <i className="bi bi-calendar-x me-2"></i>
                                    Cancelar Turno
                                </button>
                                
                                <button 
                                    onClick={handleLogout} 
                                    className="btn btn-danger btn-lg py-3 mt-4"
                                >
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};