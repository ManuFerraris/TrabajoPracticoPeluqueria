import React from 'react';
import { useNavigate } from 'react-router-dom';

const PanelAdministracionCruds: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Panel de Administracion</h1>
        <p>Bienvenido al panel. Aquí podrás gestionar:</p>
            <button onClick={() => navigate("/peluqueroList")} className="btn btn-outline-primary btn-lg py-3">
                Peluqueros
            </button>

            <button onClick={() => navigate("/clientes")} className="btn btn-outline-primary btn-lg py-3">
                Clientes
            </button>

            <button onClick={() => navigate("/turnos")} className="btn btn-outline-primary btn-lg py-3">
                Turnos
            </button>

            <button onClick={() => navigate("/servicios")} className="btn btn-outline-primary btn-lg py-3">
                Servicios
            </button>

            <button onClick={() => navigate("/tipoServicios")} className="btn btn-outline-primary btn-lg py-3">
                Tipo de Servicio
            </button>

            <button onClick={() => navigate("/localidades")} className="btn btn-outline-primary btn-lg py-3">
                Localidad
            </button>
        </div>
    );
};

export default PanelAdministracionCruds;
