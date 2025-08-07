import { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../auth/AuthProvider.tsx';
import { API_URL } from '../auth/constants.ts';

interface Peluquero {
    codigo_peluquero: number;
    nombre: string;
    email: string;
    tipo: string;
};

interface Turno {
    codigo_turno: number;
    fecha_hora: string;
    tipo_turno: string;
    porcentaje: number;
    estado: string;
    cliente: number;
    servicio: number;
    peluquero: Peluquero;
};

function ListadoTurnosPage() {
    const { user } = useAuth();
    const accessToken = localStorage.getItem('accessToken');
    const [estadoFiltro, setEstadoFiltro] = useState<string>('Activo');
    const [turnos, setTurnos] = useState<Turno[]>([]);

    useEffect(() => {
        if (!user?.codigo_peluquero) {
            return;
        }

        const fetchTurnos = async () => {
            try {
            const res = await axios.get(`${API_URL}/turnos/filtrosTurnoPorEstadoYPel`, {
                params: {
                estado: estadoFiltro,
                codigo_peluquero: user.codigo_peluquero
                },
                headers: {
                Authorization: `Bearer ${accessToken}`
                }
            });

            setTurnos(res.data);
            } catch (err) {
            console.error("Error al obtener turnos:", err);
            Swal.fire('Error', 'No se pudieron cargar los turnos.', 'error');
            };
        };
        fetchTurnos();
    }, [user,estadoFiltro,accessToken]);


const estados = ['Activo', 'Cancelado', 'Sancionado'];
    return (
        <div className="container mt-5">
        <h2 className="text-center mb-4">Mis Turnos</h2>

            <div className="d-flex justify-content-center mb-4">
                {estados.map(e => (
                <button
                    key={e}
                    className={`btn mx-2 ${estadoFiltro === e ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setEstadoFiltro(e)}
                >
                    {e}
                </button>
                ))}
            </div>
            <table className="table table-bordered table-hover">
                <thead className="table-light">
                <tr>
                    <th>Código</th>
                    <th>Fecha</th>
                    <th>Tipo</th>
                    <th>Porcentaje</th>
                    <th>Estado</th>
                    <th>Servicio</th>
                </tr>
                </thead>
                <tbody>
                    {turnos.length > 0 ? (
                        turnos.map(t => (
                        <tr key={t.codigo_turno}>
                            <td>{t.codigo_turno}</td>
                            <td>{new Date(t.fecha_hora).toLocaleString()}</td>
                            <td>{t.tipo_turno}</td>
                            <td>{t.porcentaje}%</td>
                            <td>{t.estado}</td>
                            <td>{t.servicio}</td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                        <td colSpan={6} className="text-center">No hay turnos en este estado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default ListadoTurnosPage;