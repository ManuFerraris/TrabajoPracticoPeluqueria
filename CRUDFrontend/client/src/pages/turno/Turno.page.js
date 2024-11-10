import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import Swal from 'sweetalert2';

function TurnosPage(){
    const [turnos, setTurnos] = useState([]);
    const [fecha_hora, setFecha_hora] = useState('');
    const [tipo_turno, setTipo_turno] = useState('');
    const [/*porcentaje*/, setPorcentaje] = useState('');
    const [estado, setEstado] = useState('');
    const [codigo_cliente, setCodigo_cliente] = useState('');
    //const [codigo_servicio, setCodigo_servicio] = useState('');
    const [codigo_peluquero, setCodigo_peluquero] = useState('');

    const [error, setError] = useState('');
    const [errors, setErrors] = useState('');
    const [loading, setLoading] = useState('');
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
    const [editar, setEditar] = useState(false);
    const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });


    useEffect(() => {
        const fetchTurnos = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/turnos');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTurnos(data.data || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTurnos();
    }, []);

    const formatFechaParaInput = (fechaISO) => {
        const fecha = new Date(fechaISO);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
        const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga dos dígitos
        const horas = String(fecha.getHours()).padStart(2, '0'); // Asegura que las horas tengan dos dígitos
        const minutos = String(fecha.getMinutes()).padStart(2, '0'); // Asegura que los minutos tengan dos dígitos
        return `${anio}-${mes}-${dia}T${horas}:${minutos}`; // Retorna en formato aaaa-mm-dd T hh:mm
    };

    useEffect(() => {
        if (turnoSeleccionado) {
            setFecha_hora(turnoSeleccionado.fecha_hora ? formatFechaParaInput(turnoSeleccionado.fecha_hora): '');
            setTipo_turno(turnoSeleccionado.tipo_turno || '');
            setPorcentaje(turnoSeleccionado.porcentaje || '');
            setEstado(turnoSeleccionado.estado || '');
            setCodigo_cliente(turnoSeleccionado.cliente?.codigo_cliente || '');
            setCodigo_peluquero(turnoSeleccionado.peluquero?.codigo_peluquero || '');
            //setCodigo_servicio(turnoSeleccionado.codigo_servicio || '');
        }
    }, [turnoSeleccionado]);

    const getTurnos = async () => {
        try {
            const response = await Axios.get('http://localhost:3000/api/turnos');
            const turnos = response.data.data;
            if (Array.isArray(turnos)) {
                setTurnos(turnos);
            }
        } catch (error) {
            console.error('Error al obtener los turnos:', error);
            setTurnos([]);
        }
    };

    const validateForm = () => {
        const errors = {};
        const today = new Date().toISOString().split('T')[0];

        if (!fecha_hora) {
            errors.fecha_hora = "La fecha es obligatoria.";
        } else if(fecha_hora < today){
            errors.fecha_hora = "La fecha no puede ser menor a la de hoy";
        }

        if (!tipo_turno) {
            errors.tipo_turno = "El tipo es obligatorio.";
        } else if(tipo_turno !== "Sucursal" && tipo_turno !== "A Domicilio"){
            errors.tipo_turno = "Seleccione un tipo de turno.";
        }

        if (!estado) {
            errors.estado = "El estado es obligatorio.";
        } else if(estado !== "Activo" && estado !== "Cancelado"){
            errors.estado = "Seleccione un estado.";
        }

        if (!codigo_cliente) {
            errors.codigo_cliente = "El codigo de cliente es obligatorio.";
        }

        if (!codigo_peluquero) {
            errors.codigo_peluquero = "El codigo de peluquero es obligatorio.";
        }

        /* if (!codigo_servicio){
            errors.codigo_servicio = "El codigo de servicio es obligatorio"
        }*/

        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const formattedDate = new Date(fecha_hora).toISOString();
            if (editar) {
                await Axios.put(`http://localhost:3000/api/turnos/${turnoSeleccionado.codigo_turno}`, {
                    fecha_hora: formattedDate,
                    tipo_turno: tipo_turno,
                    //porcentaje: porcentaje,
                    estado: estado,
                    codigo_cliente: Number(codigo_cliente),
                    // codigo_servicio: Number(codigo_servicio),
                    codigo_peluquero: Number(codigo_peluquero)
                    
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await Axios.post('http://localhost:3000/api/turnos', {
                    fecha_hora: formattedDate,
                    tipo_turno: tipo_turno,
                    //porcentaje: porcentaje,
                    estado: estado,
                    codigo_cliente: Number(codigo_cliente), 
                    //codigo_servicio: Number(codigo_servicio),
                    codigo_peluquero: Number(codigo_peluquero),
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Turno registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            await getTurnos();
            resetForm();
        } catch (error) {
            console.error('Error al guardar el turno:', error);
            
            if (error.response && error.response.data && error.response.data.message) {
                // Mostrar el mensaje de error específico del backend
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response.data.message,
                    confirmButtonText: 'Aceptar',
                    position: 'center'
                });
            } else {
                // Mostrar un mensaje de error genérico
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al guardar el turno.',
                    confirmButtonText: 'Aceptar',
                    position: 'center'
                });
            }
        }
    }

    const resetForm = () => {
        setFecha_hora("");
        setTipo_turno("");
        setPorcentaje("")
        setEstado("");
        setCodigo_cliente("");
        setCodigo_peluquero("");
        //setCodigo_servicio("");
        setErrors({});
        setEditar(false);
        setTurnoSeleccionado(null);
    }

    const eliminarTurno = (codigo_turno) => {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'No podrás revertir esta acción',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminarlo'
        }).then((result) => {
            if (result.isConfirmed) {
                Axios.delete(`http://localhost:3000/api/turnos/${codigo_turno}`)
                    .then(() => {
                        getTurnos();
                        Swal.fire({
                            icon: 'success',
                            title: 'Eliminado',
                            text: 'El turno ha sido eliminado con éxito.',
                            confirmButtonText: 'Aceptar'
                        });
                    })
                    .catch(error => {
                        console.error('Error al eliminar el turno:', error);
                        if (error.response && error.response.data && error.response.data.message) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: error.response.data.message,
                                confirmButtonText: 'Aceptar'
                            });
                        } else {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Error al eliminar el turno',
                                confirmButtonText: 'Aceptar'
                            });
                        }
                    });
            }
        });
    };

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
                                        onChange={(event) => setTipo_turno(event.target.value)}
                                        value={tipo_turno || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Sucursal">Sucursal</option>
                                        <option value="A Domicilio">A Domicilio</option>
                                    </select>
                                    {errors.tipo_turno && <div className="text-danger">{errors.tipo_turno}</div>}
                                </div>

                                {/* 
                                <div className="col-md-6">
                                    <label className="form-label">Porcentaje:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setPorcentaje(event.target.value)}
                                        className="form-control"
                                        value={porcentaje || ''}
                                        placeholder="Ingrese el monto (opcional)"
                                    />
                                </div>
                                */}
                                
                                <div className="col-md-6">
                                    <label className="form-label">Estado:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setEstado(event.target.value)}
                                        value={estado || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Cancelado">Cancelado</option>
                                    </select>
                                    {errors.estado && <div className="text-danger">{errors.estado}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Codigo de Cliente:</label>
                                    <input
                                        type="number"
                                        onChange={(event) => setCodigo_cliente(Number(event.target.value))}
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

                                {/*<div className="col-md-6">
                                    <label className="form-label">Codigo de Servicio:</label>
                                    <input
                                        type="number"
                                        onChange={(event) => setCodigo_servicio(Number(event.target.value))}
                                        className="form-control"
                                        value={codigo_servicio || ''}
                                        placeholder="Codigo de servicio"
                                    />
                                    {errors.codigo_servicio && <div className="text-danger">{errors.codigo_servicio}</div>}
                                </div>*/}

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
                                    <th scope="col">Porcentaje</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Cod. Cli.</th>
                                    <th scope="col">Cod. Pel.</th>
                                    <th scope="col">Cod. Ser.</th>
                                    <th scope="col">Accion</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    turnos.map(val => (
                                        <tr key={val.codigo_turno}>
                                            <th>{val.codigo_turno}</th>
                                            <td>{formatFechaParaInput(val.fecha_hora)}</td>
                                            <td>{val.tipo_turno}</td>
                                            <td>{val.porcentaje}</td>
                                            <td>{val.estado}</td>
                                            <td>{val.cliente?.codigo_cliente || 'N/A'}</td>
                                            <td>{val.peluquero?.codigo_peluquero || 'N/A'}</td>
                                            <td>{val.servicio?.codigo || 'N/A'}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm" onClick={() => { setTurnoSeleccionado(val); setEditar(true); }}>Editar</button>
                                                <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarTurno(val.codigo_turno)}>Eliminar</button>
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