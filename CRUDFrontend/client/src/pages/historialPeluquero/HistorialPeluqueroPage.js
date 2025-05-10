import React, { useEffect, useState } from 'react';
import Axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';

function HistorialPeluqueroPage() {
    const [peluqueros, setPeluqueros] = useState([]);
    const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState('');
    const [turnos, setTurnos] = useState([]);

    useEffect(() => {
        const fetchPeluqueros = async () => {
            try {
                const res = await Axios.get('http://localhost:3000/api/peluqueros');
                setPeluqueros(res.data.data || []);
            } catch (err) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar los peluqueros',
                    confirmButtonText: 'Aceptar'
                });
            }
        };
        fetchPeluqueros();
    }, []);

    const obtenerHistorial = async () => {
        if (!peluqueroSeleccionado) {
            Swal.fire({
                icon: 'warning',
                title: 'Seleccione un peluquero',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        try {
            const res = await Axios.get(`http://localhost:3000/api/turnos/historial/peluquero/${peluqueroSeleccionado}`);
            setTurnos(res.data.data || []);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Error al obtener el historial',
                confirmButtonText: 'Aceptar'
            });
        }
    };

    const formatFechaHora = (fechaISO) => {
        if (!fechaISO) return 'No disponible';
        const date = new Date(fechaISO);
        const fecha = date.toLocaleDateString();
        const hora = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `${fecha} ${hora}`;
    };

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1200px' }}>
                <div className="card-header bg-primary text-white text-center">
                    <h3>Historial de Turnos por Peluquero</h3>
                </div>

                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Seleccionar Peluquero:</label>
                            <select
                                className="form-select"
                                onChange={(e) => setPeluqueroSeleccionado(e.target.value)}
                                value={peluqueroSeleccionado}
                            >
                                <option value="">Seleccione un peluquero</option>
                                {peluqueros.map(peluquero => (
                                    <option key={peluquero.codigo_peluquero} value={peluquero.codigo_peluquero}>
                                        {peluquero.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-6 d-flex align-items-end">
                            <button className="btn btn-success w-100" onClick={obtenerHistorial}>
                                Ver Historial
                            </button>
                        </div>
                    </div>

                    <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th>Código de turno</th>
                                    <th>Fecha y hora</th>
                                    <th>Cliente atendido</th>
                                </tr>
                            </thead>
                            <tbody>
                                {turnos.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No hay turnos disponibles
                                        </td>
                                    </tr>
                                ) : (
                                    turnos.map(turno => (
                                        <tr key={turno.codigo_turno}>
                                            <td>{turno.codigo_turno}</td>
                                            <td>{formatFechaHora(turno.fecha_hora)}</td>
                                            <td>{turno.cliente?.NomyApe || 'No disponible'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HistorialPeluqueroPage;
