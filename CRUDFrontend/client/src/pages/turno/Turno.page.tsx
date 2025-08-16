import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../auth/constants.ts';

type Turno = {
    codigo_turno: number;
    fecha_hora: string;
    tipo_turno: 'Sucursal' | 'A Domicilio';
    estado: 'Activo' | 'Cancelado' | 'Sancionado';
    porcentaje?: string;
    cliente?: { codigo_cliente: number };
    peluquero?: { codigo_peluquero: number };
    servicio?: { codigo: number };
};

type FormErrors = {
    fecha_hora?: string;
    tipo_turno?: string;
    estado?: string;
    codigo_cliente?: string;
    codigo_peluquero?: string;
};

type Alerta = {
    tipo: string;
    mensaje: string;
};

function TurnosPage(){
    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [fecha_hora, setFecha_hora] = useState<string>('');
    const [tipo_turno, setTipo_turno] = useState<'Sucursal' | 'A Domicilio' | ''>('');
    const [/*porcentaje*/, setPorcentaje] = useState<string>('');
    const [estado, setEstado] = useState<'Activo' | 'Cancelado' | 'Sancionado'|''>('');
    const [codigo_cliente, setCodigo_cliente] = useState<string>('');
    const [codigo_peluquero, setCodigo_peluquero] = useState<string>('');
    const [turnoMostrado, setTurnoMostrado] = useState<number | null>(null);

    const [error, setError] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [turnoSeleccionado, setTurnoSeleccionado] = useState<Turno | null>(null);
    const [editar, setEditar] = useState<boolean>(false);
    const [alerta, setAlerta] = useState<Alerta>({ tipo: '', mensaje: '' });

    const estados = ['Cancelado', 'Activo', 'Sancionado'];
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchTurnos = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/turnos`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                const turnos = response.data.data || []
                console.log('Turnos traidos del backend:',response, turnos);
                setTurnos(turnos);
            }catch(error:any){
                setError(error.response?.data?.message || error.message);
            }finally{
                setLoading(false);
            };
        };
        fetchTurnos();
    }, [accessToken]);

    const formatFechaParaInput = (fechaISO:string) => {
        const fecha = new Date(fechaISO);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
        const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga dos dígitos
        const horas = String(fecha.getHours()).padStart(2, '0'); // Asegura que las horas tengan dos dígitos
        const minutos = String(fecha.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan dos dígitos
        return `${anio}-${mes}-${dia}T${horas}:${minutos}`; // Retorna en formato aaaa-mm-dd T hh:mm
    };

    const estadoColor = (estado: string): string => {
        switch (estado) {
            case 'Cancelado': return 'warning';
            case 'Activo': return 'primary';
            case 'Sancionado': return 'danger';
            case 'Finalizado': return 'success';
            default: return 'secondary';
        };
    };

    useEffect(() => {
        if (turnoSeleccionado) {
            setFecha_hora(turnoSeleccionado.fecha_hora ? formatFechaParaInput(turnoSeleccionado.fecha_hora): '');
            setTipo_turno(turnoSeleccionado.tipo_turno || '');
            setPorcentaje(turnoSeleccionado.porcentaje || '');
            setEstado(turnoSeleccionado.estado || '');
            setCodigo_cliente(String(turnoSeleccionado.cliente?.codigo_cliente) || '');
            setCodigo_peluquero(String(turnoSeleccionado.peluquero?.codigo_peluquero) || '');
        };
    }, [turnoSeleccionado]);

    const getTurnos = async () => {
        try {
            const response = await axios.get(`${API_URL}/turnos`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            const turnos = response.data.data;
            if (Array.isArray(turnos)) {
                setTurnos(turnos);
            };
        }catch(error:any){
            console.error('Error al obtener los turnos:', error);
            setError(error.response?.data?.data|| error.mensaje);
            setTurnos([]);
        };
    };

    const validateForm = () => {
        const errors:FormErrors = {};

        const today = new Date().toISOString().split('T')[0];

        if (!fecha_hora) {
            errors.fecha_hora = "La fecha es obligatoria.";
        } else if(fecha_hora < today){
            errors.fecha_hora = "La fecha no puede ser menor a la de hoy";
        };

        if (!tipo_turno) {
            errors.tipo_turno = "El tipo es obligatorio.";
        } else if(tipo_turno !== "Sucursal" && tipo_turno !== "A Domicilio"){
            errors.tipo_turno = "Seleccione un tipo de turno.";
        };

        if (!estado) {
            errors.estado = "El estado es obligatorio.";
        } else if(estado !== "Activo" && estado !== "Cancelado" && estado !=="Sancionado"){
            errors.estado = "Seleccione un estado.";
        };

        if (!codigo_cliente) {
            errors.codigo_cliente = "El codigo de cliente es obligatorio.";
        };

        if (!codigo_peluquero) {
            errors.codigo_peluquero = "El codigo de peluquero es obligatorio.";
        };
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        };
        const formattedDate = new Date(fecha_hora).toISOString();
        const payload = {
            fecha_hora: formattedDate,
            tipo_turno: tipo_turno,
            estado: estado,
            codigo_cliente: Number(codigo_cliente),
            codigo_peluquero: Number(codigo_peluquero)
        };
        try {
            if (editar && turnoSeleccionado) {
                await axios.put(`${API_URL}/turnos/${turnoSeleccionado.codigo_turno}`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await axios.post(`${API_URL}/turnos`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Turno registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            };
            await getTurnos();
            resetForm();
        }catch(error:any){
            console.error('Error al guardar el turno:', error);
            if (error.response && error.response.data && error.response.data.message) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.message,
                    confirmButtonText: 'Aceptar',
                    position: 'center'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al guardar el turno.',
                    confirmButtonText: 'Aceptar',
                    position: 'center'
                });
            };
        };
    };

    const resetForm = () => {
        setFecha_hora("");
        setTipo_turno("");
        setPorcentaje("")
        setEstado("");
        setCodigo_cliente("");
        setCodigo_peluquero("");
        setErrors({});
        setEditar(false);
        setTurnoSeleccionado(null);
    };

    const cambiarEstadoTurno = async (codigo_turno: number, nuevoEstado: string) => {
        try {
            const response = await axios.put(`${API_URL}/turnos/${codigo_turno}/estado`, {
                estado: nuevoEstado
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${accessToken}`
                    }
                }
            );
            const { data } = response.data;
            // Actualizar el estado local
            setTurnos(prev =>
                prev.map(t =>
                    t.codigo_turno === data.codigo_turno
                    ? { ...t, estado: data.estado }
                    : t
                )
            );
            console.log('Estado actualizado: ', data.estado);
        } catch (error: any) {
            console.error('Error al cambiar estado:', error.message);
        };
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1200px' }}>
                <div className="card-header text-center bg-primary text-white">
                    <h3>Alta de Turnos</h3>
                </div>
    
                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'hidden' }}>
                    <div className="form-container" style={{ padding: '20px', boxSizing: 'border-box' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">

                                <div className="col-md-6">
                                    <label className="form-label">Fecha y hora:</label>
                                    <input
                                        type="datetime-local"
                                        onChange={(event) => setFecha_hora(event.target.value)}
                                        className="form-control"
                                        value={fecha_hora || ""}
                                        placeholder="Ingrese la fecha y hora"
                                    />
                                    {errors.fecha_hora && <div className="text-danger">{errors.fecha_hora}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Tipo de Turno:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setTipo_turno(event.target.value as "" | "Sucursal" | "A Domicilio")}
                                        value={tipo_turno || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Sucursal">Sucursal</option>
                                        <option value="A Domicilio">A Domicilio</option>
                                    </select>
                                    {errors.tipo_turno && <div className="text-danger">{errors.tipo_turno}</div>}
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label">Estado:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setEstado(event.target.value as "" | 'Activo' | 'Cancelado' | 'Sancionado')}
                                        value={estado || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Cancelado">Cancelado</option>
                                        <option value="Sancionado">Sancionado</option>
                                    </select>
                                    {errors.estado && <div className="text-danger">{errors.estado}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Codigo de Cliente:</label>
                                    <input
                                        type="number"
                                        onChange={(event) => setCodigo_cliente(event.target.value)}
                                        className="form-control"
                                        value={codigo_cliente || ''}
                                        placeholder="Codigo de cliente"
                                    />
                                    {errors.codigo_cliente && <div className="text-danger">{errors.codigo_cliente}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Codigo de Peluquero:</label>
                                    <input
                                        type="number"
                                        onChange={(event) => setCodigo_peluquero(event.target.value)}
                                        className="form-control"
                                        value={codigo_peluquero || ''}
                                        placeholder="Codigo de peluquero"
                                    />
                                    {errors.codigo_peluquero && <div className="text-danger">{errors.codigo_peluquero}</div>}
                                </div>
                            </div>

                            <div className="text-center">
                                {
                                    editar ?
                                        <div>
                                            <button type="submit" className='btn btn-warning m-2'>Actualizar</button>
                                            <button type="button" className='btn btn-secondary m-2' onClick={() => {setEditar(false); resetForm();}}>Cancelar</button>
                                        </div>
                                        :
                                        <button type="submit" className='btn btn-success'>Registrar</button>
                                }
                            </div>
                        </form>
                    </div>
    
                    <div className="table-container" style={{ flex: 1, overflowY: 'auto'}}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th scope="col">Código</th>
                                    <th scope="col">Fecha</th>
                                    <th scope="col">Tipo</th>
                                    <th scope="col" className="text-end" style={{ paddingRight: '100px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                { turnos.map(val => (
                                        <tr key={val.codigo_turno}>
                                            <th>{val.codigo_turno}</th>
                                            <td>{formatFechaParaInput(val.fecha_hora)}</td>
                                            <td>{val.tipo_turno}</td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    {turnoMostrado === val.codigo_turno ? (
                                                        <div>
                                                            <p>Porcentaje: {val.porcentaje}</p>
                                                            <p>Estado: {val.estado}</p>
                                                            <p>Cod. Cli.: {val.cliente?.codigo_cliente || 'N/A'}</p>
                                                            <p>Cod. Pel.: {val.peluquero?.codigo_peluquero || 'N/A'}</p>
                                                            <p>Ser. Cod.: {val.servicio?.codigo || 'N/A'}</p>
                                                            <button className="btn btn-secondary btn-sm" onClick={() => setTurnoMostrado(null)}>Ocultar</button>
                                                        </div>

                                                    ) : (
                                                        <button className="btn btn-primary btn-sm" onClick={() => setTurnoMostrado(val.codigo_turno)}>Mostrar Más</button>
                                                    )}
                                                    <button className="btn btn-primary btn-sm" onClick={() => { setTurnoSeleccionado(val); setEditar(true); }}>Editar</button>
                                                </div>
                                                <div className="mt-2">
                                                    <span className={`badge bg-${estadoColor(val.estado)}`}>
                                                        Estado actual: {val.estado}
                                                    </span>
                                                    <div className="d-flex flex-wrap gap-2 mt-2">
                                                        {estados
                                                            .filter((estado) => estado !== val.estado)
                                                            .map((estado) => (
                                                                <button
                                                                    key={estado}
                                                                    className={`btn btn-sm btn-outline-${estadoColor(estado)}`}
                                                                    onClick={() => cambiarEstadoTurno(val.codigo_turno, estado)}
                                                                >
                                                                    Marcar como {estado}
                                                                </button>
                                                            ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    
            {alerta.mensaje && (
            <div className={`alert alert-${alerta.tipo} alert-dismissible fade show`} role="alert" style={{ position: 'fixed', bottom: '0', width: '100%', zIndex: 1050 }}>
                {alerta.mensaje}
                <button type="button" className="btn-close" onClick={() => setAlerta({ tipo: '', mensaje: '' })}></button>
            </div>
            )}
        </div>
    );
}
export default TurnosPage;