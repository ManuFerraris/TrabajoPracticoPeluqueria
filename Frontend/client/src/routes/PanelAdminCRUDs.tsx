import React from 'react';
import { useNavigate } from 'react-router-dom';

const PanelAdministracionCruds: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="container py-5 bg-light rounded shadow">
            <div className="text-center mb-5">
                <h1 className="display-5 fw-bold text-dark">Panel de Administración</h1>
                <p className="lead text-secondary">Bienvenido al panel. Aquí podrás gestionar las entidades del sistema:</p>
            </div>

            <div className="row g-4 justify-content-center">
                <div className="col-md-4">
                    <button onClick={() => navigate("/peluqueroList")} className="btn btn-outline-primary w-100 py-3">
                        Peluqueros
                    </button>
                </div>
                <div className="col-md-4">
                    <button onClick={() => navigate("/clientesCrud")} className="btn btn-outline-primary w-100 py-3">
                        Clientes
                    </button>
                </div>
                <div className="col-md-4">
                    <button onClick={() => navigate("/turnos")} className="btn btn-outline-primary w-100 py-3">
                        Turnos
                    </button>
                </div>
                <div className="col-md-4">
                    <button onClick={() => navigate("/servicios")} className="btn btn-outline-primary w-100 py-3">
                        Servicios
                    </button>
                </div>
                <div className="col-md-4">
                    <button onClick={() => navigate("/tipoServicios")} className="btn btn-outline-primary w-100 py-3">
                        Tipo de Servicio
                    </button>
                </div>
                <div className="col-md-4">
                    <button onClick={() => navigate("/localidades")} className="btn btn-outline-primary w-100 py-3">
                        Localidad
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PanelAdministracionCruds;
