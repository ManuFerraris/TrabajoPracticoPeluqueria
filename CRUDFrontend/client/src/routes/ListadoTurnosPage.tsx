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
    const estados = ['Activo', 'Cancelado', 'Sancionado'];

    console.log("Estamos en Mis Turnos!")
    useEffect(() => {
        if (!user?.codigo) {
            console.log("Esperando datos de sesión...");
            console.log("Datos del peluquero: ", user);
            return;
        };
        const fetchTurnos = async () => {
            console.log("Estamos en fetchTurnos!");
            try {
                const response = await axios.get(`${API_URL}/turnos/filtrosTurnoPorEstadoYPel`, {
                    params: {
                        estado: estadoFiltro,
                        codigo_peluquero: user.codigo
                    },
                        headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                });
                const turnos = response.data.data || [];
                console.log("Turnos traidos del backend: ", turnos);
                
                if(response.status === 200){
                    setTurnos(turnos);
                    return;
                }

                if(response.status === 200 && turnos.length === 0){
                    Swal.fire({
                        icon: "info",
                        title: "Sin turnos",
                        text: `No hay turnos con estado ${estadoFiltro} para este peluquero.`,
                        confirmButtonText: "Aceptar"
                    });
                    setTurnos([]);
                    return;
                };
            } catch (error:any) {
                const status = error.response?.status;
                const mensajeBackend = error.response?.data?.message ?? "Error inesperado al traer el turno.";

                // Caso: backend devuelve 400 PERO es una respuesta controlada
                if (status === 400 && error.response?.data?.data?.length === 0) {
                    Swal.fire({
                        icon: "info",
                        title: "Sin turnos",
                        text: mensajeBackend,
                        confirmButtonText: "Aceptar"
                    });
                    setTurnos([]);
                    return;
                };
                // Error real
                console.error("Error al traer turnos:", mensajeBackend);
                Swal.fire({
                    icon: "error",
                    title: "Error al obtener turnos",
                    text: mensajeBackend,
                    confirmButtonText: "Aceptar"
                });
            };
        };
        fetchTurnos();
    }, [user, estadoFiltro, accessToken]);

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