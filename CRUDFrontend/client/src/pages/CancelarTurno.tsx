import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../auth/constants.ts";
import { useAuth } from "../auth/AuthProvider.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';

type Turno = {
    codigo_turno: number;
    estado: string;
    fecha_hora:string;
};

function CancelarTurno() {
    const { user } = useAuth();
    const accessToken = localStorage.getItem('accessToken');

    const [codigo_turno, setCodigo_turno] = useState<number | null>(null);
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const codCli = user?.codigo;

    useEffect(()=> {
        const fetchTurnos = async () => {
            setLoading(true);
            try{
                const response = axios.get(`${API_URL}/clientes/misTurnosActivos/${codCli}`,{
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const turnos = (await response).data.data || [];
                setTurnos(turnos);
            }catch(error:any){
                if (error.response && error.response.data && Array.isArray(error.response.data.errores)) {
                    console.error(error.response.data.errores);
                } else {
                    console.error("Error inesperado:", error);
                }
            }finally{
                setLoading(false);
            }
        };
        fetchTurnos();
    },[accessToken, codCli]);

    //Continuar con la baja logica del turno...
    const confirmarAccion = async (titulo: string, texto: string): Promise<boolean> => {
        const resultado = await Swal.fire({
            title: titulo,
            text: texto,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "No",
            reverseButtons: true
        });
        return resultado.isConfirmed;
    };

    const cancelarTurno = async (codigo_turno: number) => {

        const estadoCancelado:string = 'Cancelado';

        try{
            const response = await axios.put(`${API_URL}/turnos/${codigo_turno}/estado`,
                { estado: estadoCancelado },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${accessToken}`
                    }
                }
            );
            const { data } = response.data;

            if(response.status === 200){
                // Actualizar el estado local
                setTurnos(prev =>
                    prev.map(t =>
                        t.codigo_turno === data.codigo_turno
                        ? { ...t, estado: data.estado }
                        : t
                    )
                );
                Swal.fire({
                    icon: "success",
                    title: "Turno cancelado",
                    text: `El turno ${data.codigo_turno} fue ${data.estado}.`,
                    confirmButtonText: "Aceptar"
                });

                // Para quitar el turno del render una vez dado de baja.
                setTurnos(prev =>
                    prev.filter(t => t.codigo_turno !== data.codigo_turno)
                );
            } else {
                const mensajeBackend = response.data?.message ?? "No se pudo actualizar el estado.";
                Swal.fire({
                    icon: "warning",
                    title: "Atención",
                    text: mensajeBackend,
                    confirmButtonText: "Aceptar"
                });
                return;
            };
        }catch(error:any){
            const mensajeBackend =  error.response?.data?.message
            ?? "Error inesperado al cancelar el turno.";

            console.error("Error al cambiar estado:", mensajeBackend);

            Swal.fire({
                icon: "error",
                title: "Error al cancelar turno",
                text: mensajeBackend,
                confirmButtonText: "Aceptar"
            });
        };
    };

    if(loading) return (<div>Cargando datos...</div>)

    return(
        <div className="container mt-4">
            <div className="text-center mb-4">
                <h1 className="text-danger fw-bold">Cancelar turno</h1>
                <h5 className="text-muted">
                    Usa esta seccion para cancelar un turno ya reservado. Esta accion no se puede deshacer.
                </h5>
            </div>
            <div className="d-flex justify-content-center">
                <div className="mb-4">
                    <label htmlFor="turnoSelect" className="form-label fw-semibold">
                        Selecciona un turno a cancelar
                    </label>
                    <select
                        id="turnoSelect"
                        className="form-select"
                        value={codigo_turno ?? ""}
                        onChange={(e)=> {
                            const value = e.target.value;
                            setCodigo_turno(value ? Number(value) : null);
                        }}
                    >
                        <option value="">Seleccionar un turno...</option>
                        {turnos.map((turno) => (
                            <option key={turno.codigo_turno} value={turno.codigo_turno}>
                                {new Date(turno.fecha_hora).toLocaleString()} - Estado: {turno.estado}
                            </option>
                        ))}
                    </select>
                    {codigo_turno && (
                        <div className="alert alert-info mt-3">
                            Codigo de turno seleccionado: <strong>{codigo_turno}</strong>
                        </div>
                    )}
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-danger fw-semibold"
                            style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            fontSize: "15px",
                            whiteSpace: "nowrap"
                            }}
                            onClick={ async () => {
                                if (!codigo_turno) {
                                    Swal.fire("Error", "Seleccioná un turno válido para cancelar", "error");
                                    return;
                                };
                                const confirmado = await confirmarAccion(
                                    "¿Estás seguro?",
                                    "Esta acción cancelara el turno."
                                );
                                if (confirmado) {
                                    cancelarTurno(codigo_turno);
                                    setCodigo_turno(null);
                                };
                            }}
                            title="Seleccioná un turno primero"
                            disabled={!codigo_turno}
                            >
                            Cancelar turno
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CancelarTurno;