import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL } from '../../auth/constants.ts';
import { useAuth } from '../../auth/AuthProvider.tsx';

function HistorialPeluqueroPage() {
    const [turnos, setTurnos] = useState([]);
    const { user: userData } = useAuth();
    const accessToken = localStorage.getItem('accessToken');
    
    // Estados para el selector del admin
    const [peluqueros, setPeluqueros] = useState([]);
    const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState('');

    useEffect(() => {
        if (userData?.rol === 'admin') {
            // Si es admin, carga la lista de todos los peluqueros para el selector
            const fetchPeluqueros = async () => {
                try {
                    const res = await axios.get(`${API_URL}/peluqueros`, { headers: { Authorization: `Bearer ${accessToken}` }});
                    setPeluqueros(res.data.data || []);
                } catch (err) {
                    console.error("Error cargando peluqueros para admin:", err);
                    Swal.fire('Error', 'No se pudieron cargar los peluqueros.', 'error');
                }
            };
            fetchPeluqueros();
        } else if (userData?.rol === 'peluquero') {
            // Si es peluquero, carga su propio historial automáticamente
            obtenerHistorial(userData.codigo);
        }
    }, [userData, accessToken]);

    const obtenerHistorial = async (codigoPeluquero) => {
        if (!codigoPeluquero) return; // No hace nada si no hay un código
        try {
            const res = await axios.get(`${API_URL}/turnos/historial-peluquero/${codigoPeluquero}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log("Respuesta del servidor para historial peluquero:", res.data);
            setTurnos(res.data.data || []);
        } catch (err) {
            console.error("Error obteniendo el historial del peluquero:", err);
            Swal.fire('Error', 'No se pudo obtener el historial del peluquero.', 'error');
        }
    };
    
    // Función para dar formato a la fecha y hora
    const formatFechaHora = (fechaISO) => {
        if (!fechaISO) return 'No disponible';
        const date = new Date(fechaISO);
        return date.toLocaleString('es-AR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1200px' }}>
                <div className="card-header bg-primary text-white text-center">
                    <h3>{userData?.rol === 'admin' ? 'Historial de Turnos por Peluquero' : 'Mi Historial de Atenciones'}</h3>
                </div>
                <div className="card-body">
                    {/* El selector de peluqueros solo se muestra si el usuario es admin */}
                    {userData?.rol === 'admin' && (
                        <div className="row mb-3">
                            <div className="col-md-6">
                                <label className="form-label">Seleccionar Peluquero:</label>
                                <select className="form-select" onChange={(e) => setPeluqueroSeleccionado(e.target.value)} value={peluqueroSeleccionado}>
                                    <option value="">Seleccione un peluquero</option>
                                    {peluqueros.map(p => (
                                        <option key={p.codigo_peluquero} value={p.codigo_peluquero}>{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="col-md-6 d-flex align-items-end">
                                <button className="btn btn-success w-100" onClick={() => obtenerHistorial(peluqueroSeleccionado)}>Ver Historial</button>
                            </div>
                        </div>
                    )}

                    {/* Tabla para mostrar los turnos */}
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th>Código de Turno</th>
                                    <th>Fecha y Hora</th>
                                    <th>Cliente Atendido</th>
                                </tr>
                            </thead>
                            <tbody>
                                {turnos.length > 0 ? (
                                    turnos.map(turno => (
                                        <tr key={turno.codigo_turno}>
                                            <td>{turno.codigo_turno}</td>
                                            <td>{formatFechaHora(turno.fecha_hora)}</td>
                                            <td>{turno.cliente?.NomyApe || 'No disponible'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center">
                                            No hay turnos en el historial.
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

export default HistorialPeluqueroPage;