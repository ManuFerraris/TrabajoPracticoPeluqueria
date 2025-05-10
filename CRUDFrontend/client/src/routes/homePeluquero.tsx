import React from 'react';
import { useNavigate, Navigate  } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomePeluquero() {
    const navigate = useNavigate();
    const auth = useAuth();
    const rawUser = localStorage.getItem("user");
    const user = rawUser ? JSON.parse(rawUser) : null;
    
    if (!auth.isAuthenticated || !auth.user) {
        return <Navigate to="/login" replace />;
    }
    
    const handleLogout = () => {
        auth.logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold text-primary">Bienvenido, {user.nombre}</h1>
                <p className="text-muted fs-5">¿Sale corte rocho?</p>
            </div>
    
            {/* Resumen Rápido */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card text-white bg-primary mb-3 shadow-sm">
                        <div className="card-body">
                            <h5 className="card-title">Turnos activos</h5>
                            <p className="card-text display-6">12</p> {/* dinámico en el futuro */}
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
    
            {/* Acciones */}
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow border-0">
                        <div className="card-body p-4">
                            <h4 className="text-center mb-4">Acciones Rápidas</h4>
                            <div className="d-grid gap-3">

                                <button onClick={() => navigate("/listado-turnos")} className="btn btn-primary btn-lg py-3">
                                    <i className="bi bi-calendar-plus me-2"></i>
                                    Ver mis Turnos
                                </button>

                                <button onClick={() => navigate("/historial-turnos")} className="btn btn-outline-primary btn-lg py-3">
                                    <i className="bi bi-list-check me-2"></i>
                                    Historial de Turnos
                                </button>

                                <button onClick={() => navigate("/editar-perfil")} className="btn btn-outline-secondary btn-lg py-3">
                                    <i className="bi bi-person-gear me-2"></i>
                                    Editar Perfil
                                </button>

                                <button onClick={() => navigate("/peluquero")} className="btn btn-outline-primary btn-lg py-3">
                                    <i className="bi bi-list-check me-2"></i>
                                    Informacion de peluqueros
                                </button>

                                <button onClick={() => navigate("/baja-turno")} className="btn btn-outline-warning btn-lg py-3">
                                    <i className="bi bi-calendar-x me-2"></i>
                                    Cancelar Turno
                                </button>

                                <button onClick={handleLogout} className="btn btn-danger btn-lg py-3 mt-4">
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
}