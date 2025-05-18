import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL } from '../../auth/constants.ts';

function HistorialClientePage() {
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [turnos, setTurnos] = useState([]);
    const accessToken = localStorage.getItem('accessToken'); // Obtener el token de acceso del localStorage

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                console.log("Token de acceso:", accessToken);
                const res = await axios.get(`${API_URL}/clientes`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                        }
                    });
                setClientes(res.data.data || []);
            } catch (err) {
                console.error("Error detallado:", err.response?.data);
                Swal.fire({
                    icon: 'error',
                    title: 'Error al cargar los clientes!!!',
                    confirmButtonText: 'Aceptar'
                });
            }
        };
        fetchClientes();
    }, [accessToken]);

    const obtenerHistorial = async () => {
        if (!clienteSeleccionado) {
            Swal.fire({
                icon: 'warning',
                title: 'Seleccione un cliente',
                confirmButtonText: 'Aceptar'
            });
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/turnos/historial/cliente/${clienteSeleccionado}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                    }
                });
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
                    <h3>Historial de Turnos por Cliente</h3>
                </div>

                <div className="card-body">
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label">Seleccionar Cliente:</label>
                            <select
                                className="form-select"
                                onChange={(e) => setClienteSeleccionado(e.target.value)}
                                value={clienteSeleccionado}
                            >
                                <option value="">Seleccione un cliente</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.codigo_cliente} value={cliente.codigo_cliente}>
                                        {cliente.NomyApe}
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
                                    <th>Atendido por el peluquero</th>
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
                                            <td>{turno.peluquero?.nombre || 'No disponible'}</td>
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

export default HistorialClientePage;
