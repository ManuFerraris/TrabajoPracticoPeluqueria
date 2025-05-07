import React from 'react';
import { useNavigate, Navigate  } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomeCliente() {
    const navigate = useNavigate();
    const auth = useAuth();
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;

    if (!auth.isAuthenticated || !auth.user) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        auth.logout();
        navigate('/', { replace: true });
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
                                    onClick={() => navigate("/sacar-turno")} 
                                    className="btn btn-primary btn-lg py-3"
                                >
                                    <i className="bi bi-calendar-plus me-2"></i>
                                    Sacar Turno
                                </button>
                                
                                <button 
                                    onClick={() => navigate("/mis-turnos")} 
                                    className="btn btn-outline-primary btn-lg py-3"
                                >
                                    <i className="bi bi-list-check me-2"></i>
                                    Ver Mis Turnos
                                </button>
                                
                                <button 
                                    onClick={() => navigate("/editar-perfil")} 
                                    className="btn btn-outline-secondary btn-lg py-3"
                                >
                                    <i className="bi bi-person-gear me-2"></i>
                                    Editar Perfil
                                </button>
                                
                                <button 
                                    onClick={() => navigate("/baja-turno")} 
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