import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'bootstrap/dist/css/bootstrap.min.css';
import { API_URL } from '../../auth/constants.ts';
import { useAuth } from '../../auth/AuthProvider.tsx';
import { useCallback } from 'react';

interface Turno {
    codigo_turno: number;
    fecha_hora: string;
    cliente?: {
        NomyApe: string;
    };
    pago?: {
        metodo: string;
        monto: number;
        estado: string;
        fecha: Date;
    };
};

interface Peluquero {
    codigo_peluquero: number;
    nombre: string;
};

interface UserData {
    rol: 'cliente' | 'peluquero' | 'admin';
    codigo: number;
};

function HistorialPeluqueroPage() {
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
    const { user: userData } = useAuth() as { user:UserData };
    const accessToken = localStorage.getItem('accessToken');
    const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState<string>('');

    const obtenerHistorial = useCallback(async (codigoPeluquero: string) => {
        if (!codigoPeluquero) return;
        try {
            const res = await axios.get<{data:Turno[]; message?: string}>(`${API_URL}/peluqueros/misTurnosPeluquero/${codigoPeluquero}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            console.log("Respuesta del servidor para historial peluquero:", res.data);
            const turnosRecibidos = res.data.data || []
            setTurnos(turnosRecibidos);

            if (turnosRecibidos.length === 0) {
                Swal.fire('Historial vacío', 'No tenés turnos registrados aún.', 'info');
            };
        } catch (err) {
            console.error("Error obteniendo el historial del peluquero:", err);
            Swal.fire('Error', 'No se pudo obtener el historial del peluquero.', 'error');
        }
    }, [accessToken]);

    useEffect(() => {
        if (userData?.rol === 'admin') {
            // Si es admin, carga la lista de todos los peluqueros para el selector
            const fetchPeluqueros = async () => {
                try {
                    const res = await axios.get(`${API_URL}/peluqueros`, { headers: { Authorization: `Bearer ${accessToken}` }});
                    
                    const peluqueros = res.data.data || []
                    console.log("Peluqueros traidos: ", peluqueros);

                    setPeluqueros(peluqueros);
                } catch (err) {
                    console.error("Error cargando peluqueros para admin:", err);
                    Swal.fire('Error', 'No se pudieron cargar los peluqueros.', 'error');
                }
            };
            fetchPeluqueros();
        } else if (userData?.rol === 'peluquero') {
            // Si es peluquero, carga su propio historial automáticamente
            obtenerHistorial(String(userData.codigo));
        };
    }, [userData, accessToken, obtenerHistorial]);

    // Función para dar formato a la fecha y hora
    const formatFechaHora = (fechaISO: string | undefined) => {
        if (!fechaISO) return 'No disponible';
        const date = new Date(fechaISO);
        return date.toLocaleString('es-AR', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-200">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1400px' }}>
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
                                <button className="btn btn-success w-40" onClick={() => obtenerHistorial(peluqueroSeleccionado)}>Ver Historial</button>
                            </div>
                        </div>
                    )}

                    {/* Tabla para mostrar los turnos */}
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th>Código de turno</th>
                                    <th>Fecha y hora</th>
                                    <th>Cliente atendido</th>
                                    <th>Monto</th>
                                    <th>Estado de pago</th>
                                    <th>Metodo de pago</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(turnos) && turnos.length > 0 ? (
                                    turnos.map(turno => (
                                    <tr key={turno.codigo_turno}>
                                        <td>{turno.codigo_turno}</td>
                                        <td>{formatFechaHora(turno.fecha_hora)}</td>
                                        <td>{turno.cliente?.NomyApe || 'No disponible'}</td>
                                        <td>{turno.pago ? `$${turno.pago.monto}` : '-'}</td>
                                        <td>{turno.pago ? turno.pago.estado : 'Sin registrar'}</td>
                                        <td>{turno.pago ? turno.pago.metodo : '-'}</td>
                                    </tr>
                                    ))
                                ) : (
                                    <tr>
                                    <td colSpan={6} className="text-center">No hay turnos disponibles</td>
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