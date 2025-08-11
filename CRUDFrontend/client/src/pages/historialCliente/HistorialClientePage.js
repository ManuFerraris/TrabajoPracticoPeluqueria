import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL } from '../../auth/constants.ts';
import { useAuth } from '../../auth/AuthProvider.tsx';

function HistorialClientePage() {
    const [turnos, setTurnos] = useState([]);
    const { user: userData } = useAuth();
    const accessToken = localStorage.getItem('accessToken');
    const [clientes, setClientes] = useState([]);
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');

    useEffect(() => {
        if (userData?.rol === 'admin') {
            const fetchClientes = async () => {
                try {
                    const res = await axios.get(`${API_URL}/clientes`, { headers: { Authorization: `Bearer ${accessToken}` }});
                    setClientes(res.data.data || []);
                } catch (err) {
                    console.error("Error cargando clientes para admin:", err);
                    Swal.fire('Error', 'No se pudieron cargar los clientes.', 'error');
                }
            };
            fetchClientes();
        } else if (userData?.rol === 'cliente') {
            obtenerHistorial(userData.codigo);
        }
    }, [userData, accessToken]);

    const obtenerHistorial = async (codigoCliente) => {
        if (!codigoCliente) return;
        try {
            const res = await axios.get(`${API_URL}/turnos/historial-cliente/${codigoCliente}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log("Respuesta del servidor:", res.data); 
            setTurnos(res.data.data || []);
        } catch (err) {
            console.error("Error obteniendo el historial:", err);
            Swal.fire('Error', 'No se pudo obtener el historial.', 'error');
        }
    };

    const formatFechaHora = (fechaISO) => {
        if (!fechaISO) return 'No disponible';
        const date = new Date(fechaISO);
        return date.toLocaleString('es-AR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    if (userData?.rol === 'peluquero') {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger text-center" role="alert">
                    <h4 className="alert-heading">Acceso Denegado</h4>
                    <p>Los peluqueros no tienen permiso para acceder a esta sección.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1200px' }}>
                <div className="card-header bg-primary text-white text-center">
                    <h3>{userData?.rol === 'admin' ? 'Historial de Turnos por Cliente' : 'Mi Historial de Turnos'}</h3>
                </div>
                <div className="card-body">
                    {/* Mostrar selector solo para el admin */}
                    {userData?.rol === 'admin' && (
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Seleccionar Cliente:</label>
                                <select className="form-select" onChange={(e) => setClienteSeleccionado(e.target.value)} value={clienteSeleccionado}>
                                    <option value="">Seleccione un cliente</option>
                                    {clientes.map(c => (
                                        <option key={c.codigo_cliente} value={c.codigo_cliente}>{c.NomyApe}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 d-flex align-items-end">
                                <button className="btn btn-success w-100" onClick={() => obtenerHistorial(clienteSeleccionado)}>Ver Historial</button>
                            </div>
                        </div>
                    )}

                        <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th>Código de Turno</th>
                                    <th>Fecha y Hora</th>
                                    <th>Atendido por</th>
                                </tr>
                            </thead>
                            <tbody>
                                {turnos.length > 0 ? (
                                    turnos.map(turno => (
                                        <tr key={turno.codigo_turno}>
                                            <td>{turno.codigo_turno}</td>
                                            <td>{formatFechaHora(turno.fecha_hora)}</td>
                                            <td>{turno.peluquero?.nombre || 'No disponible'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            No hay turnos en tu historial.
                                        </td>
                                    </tr>
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