import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import Swal from 'sweetalert2';

function ServiciosPage(){
    const [servicios, setServicios] = useState([]);
    const [monto, setMonto] = useState('');
    const [estado, setEstado] = useState('');
    const [/*adicional_adom*/, setAdicional_adom] = useState('');
    const [ausencia_cliente, setAusencia_cliente] = useState('');
    const [medio_pago, setMedio_pago] = useState('');
    const [turno_codigo_turno, setTurno] = useState('');
    const [tipo_servicio_codigo, setCodigo_tipo] = useState('')
    const [/*total*/, setTotal] = useState('');
    const [tipoServicio, setTipoServicio] = useState([]);

    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState(false);
    const [editar, setEditar] = useState(false);
    const [alerta, setAlerta] = useState('');
    useEffect(() => {
        const fetchServicios = async () => {
            setLoading(true);
            try {
                const response = await fetch('http://localhost:3000/api/servicios');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setServicios(data.data || []);
            } catch (error) {
                setError(error.message);
                console.error('Error al cargar los servicios:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTipoServicio = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/tipoServicio'); // Ruta de API para tipos de servicio
                const data = await response.json();
                setTipoServicio(data.data || []);
                console.log("Tipos de Servicio cargados:", data.data);
            } catch (error) {
                console.error("Error al cargar tipos de servicio:", error);
            }
        };
        fetchServicios();
        fetchTipoServicio();
    }, []);

    useEffect(() => {
        if (servicioSeleccionado) {
            setMonto(servicioSeleccionado.monto || '');
            setEstado(servicioSeleccionado.estado || '');
            setAdicional_adom(servicioSeleccionado.adicional_adom || '');
            setAusencia_cliente(servicioSeleccionado.ausencia_cliente || '');
            setMedio_pago(servicioSeleccionado.medio_pago || '');
            setTurno(servicioSeleccionado.turno || '');
            setTotal(servicioSeleccionado.total || '');
            setCodigo_tipo(servicioSeleccionado.tipo_servicio_codigo || '');
            console.log("Servicio seleccionado:", servicioSeleccionado);
        }
    }, [servicioSeleccionado]);

    const getServicios = async () => {
        try {
            const response = await Axios.get('http://localhost:3000/api/servicios');
            const servicios = response.data.data;
            if (Array.isArray(servicios)) {
                setServicios(servicios);
            }
        } catch (error) {
            console.error('Error al obtener los Servicios:', error);
            setServicios([]);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!monto) {
            errors.monto = "El monto es obligatorio.";
        };

        if (!estado) {
            errors.estado = "El estado es obligatiorio.";
        } else if(estado !== "Pendiente" && estado !== "Pago"){
            errors.estado = "El Seleccione un estado.";
        };

        if (!medio_pago) {
            errors.medio_pago = "Seleccione un medio de pago.";
        } else if(medio_pago !== "Efectivo" && medio_pago !== "Mercado Pago"){
            errors.medio_pago = "Seleccione un medio de pago.";
        };

        if (!ausencia_cliente) {
            errors.ausencia_cliente = "Seleccione una opcion.";
        } else if(ausencia_cliente !== "Se presento" && ausencia_cliente !== "Esta ausente"){
            errors.ausencia_cliente = "Seleccione una opcion.";
        };

        if(!turno_codigo_turno){
            errors.turno_codigo_turno = "El codigo de turno es obligatorio."
        };

        if(!tipo_servicio_codigo){
            errors.tipo_servicio_codigo = "El codigo del Tipo de Servicio es obligatorio."
        };
        
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
            if (editar) {

                console.log("Datos enviados en PUT:", {
                    monto: Number(monto),
                    estado: estado,
                    ausencia_cliente: ausencia_cliente,
                    medio_pago: medio_pago,
                    turno_codigo_turno: turno_codigo_turno,
                    tipo_servicio_codigo: tipo_servicio_codigo,
                });

                await Axios.put(`http://localhost:3000/api/servicios/${servicioSeleccionado.codigo}`, {
                    monto: Number(monto),
                    estado: estado,
                    ausencia_cliente: ausencia_cliente,
                    medio_pago: medio_pago,
                    turno_codigo_turno: turno_codigo_turno,
                    tipo_servicio_codigo:tipo_servicio_codigo,
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {

                console.log("Datos enviados en POST:", {
                    monto: monto,
                    estado: estado,
                    ausencia_cliente: ausencia_cliente,
                    medio_pago: medio_pago,
                    turno_codigo_turno: turno_codigo_turno,
                    tipo_servicio_codigo: tipo_servicio_codigo,
                });
    
                await Axios.post('http://localhost:3000/api/servicios', {
                    monto: Number(monto),
                    estado: estado,
                    ausencia_cliente: ausencia_cliente,
                    medio_pago: medio_pago,
                    turno_codigo_turno: turno_codigo_turno,
                    tipo_servicio_codigo: tipo_servicio_codigo,
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Servicio registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            await getServicios();
            resetForm();
        } catch (error) {
            console.error('Error al guardar el servicio:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el Servicio.',
                confirmButtonText: 'Aceptar',
                position: 'center'
            });
        }
    }

    const resetForm = () => {
        setMonto("");
            setEstado("");
            setAdicional_adom("");
            setAusencia_cliente("");
            setMedio_pago("");
            setTurno("");
            setCodigo_tipo("")
            setErrors({});
            setEditar(false);
            setServicioSeleccionado(false);
    };

    const eliminarServicio = (codigo) => {
        Axios.get(`http://localhost:3000/api/turnos?codigo=${codigo}`)
            .then(response => {
                const turnosAsignados = response.data;
    
                if (turnosAsignados.length > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se puede eliminar',
                        text: `No se puede eliminar el Servicio con código ${codigo} porque tiene turno/s asignado/s.`,
                        confirmButtonText: 'Aceptar'
                    });
                } else {
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
                            Axios.delete(`http://localhost:3000/api/servicios/${codigo}`)
                                .then(() => {
                                    getServicios();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Eliminado',
                                        text: 'El servicio ha sido eliminado con éxito.',
                                        confirmButtonText: 'Aceptar'
                                    });
                                })
                                .catch(error => {
                                    console.error('Error al eliminar el servicio:', error);
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
                                            text: 'Error al eliminar el servicio',
                                            confirmButtonText: 'Aceptar'
                                        });
                                    }
                                });
                        }
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al verificar los turnos del servicio',
                    confirmButtonText: 'Aceptar'
                });
            });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1200px' }}>
                <div className="card-header text-center bg-primary text-white">
                    <h3>Alta de Servicios</h3>
                </div>
    
                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'hidden' }}>
                    <div className="form-container" style={{ padding: '20px', boxSizing: 'border-box' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">

                                <div className="col-md-6">
                                    <label className="form-label">Monto:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setMonto(event.target.value)}
                                        className="form-control"
                                        value={monto || ""}
                                        placeholder="Ingrese el monto"
                                    />
                                    {errors.monto && <div className="text-danger">{errors.monto}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Estado:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setEstado(event.target.value)}
                                        value={estado || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Pago">Pago</option>
                                    </select>
                                    {errors.estado && <div className="text-danger">{errors.estado}</div>}
                                </div>

                                {/*
                                <div className="col-md-6">
                                    <label className="form-label">Adicional a Domicilio:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setAdicional_adom(event.target.value)}
                                        className="form-control"
                                        value={adicional_adom || ''}
                                        placeholder="Ingrese el monto (opcional)"
                                    />
                                </div>
                                */}

                                <div className="col-md-6">
                                    <label className="form-label">Ausencia Cliente:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setAusencia_cliente(event.target.value)}
                                        value={ausencia_cliente || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Se presento">Se presento</option>
                                        <option value="Esta ausente">Esta ausente</option>
                                    </select>
                                    {errors.ausencia_cliente && <div className="text-danger">{errors.ausencia_cliente}</div>}
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label">Medio de Pago:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setMedio_pago(event.target.value)}
                                        value={medio_pago || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Mercado Pago">Mercado Pago</option>
                                    </select>
                                    {errors.medio_pago && <div className="text-danger">{errors.medio_pago}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Tipo de Servicio:</label>
                                    <select
                                        onChange={(e) => setCodigo_tipo(e.target.value)}
                                        value={tipo_servicio_codigo || ''}
                                        className="form-select"
                                    >
                                        <option value="">Seleccione un tipo de servicio</option>
                                        {tipoServicio.map((tipo) => (
                                            <option key={tipo.codigo_tipo} value={tipo.codigo_tipo}>
                                                {tipo.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.tipo_servicio_codigo && <div className="text-danger">{errors.tipo_servicio_codigo}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Codigo de Turno:</label>
                                    <input
                                        type="number"
                                        onChange={(event) => setTurno(Number(event.target.value))}
                                        className="form-control"
                                        value={turno_codigo_turno || ''}
                                        placeholder="Codigo de turno"
                                    />
                                    {errors.turno_codigo_turno && <div className="text-danger">{errors.turno_codigo_turno}</div>}
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
                                    <th scope="col">Monto</th>
                                    <th scope="col">Medio de Pago</th>
                                    <th scope="col">Estado</th>
                                    <th scope="col">Adic. a Dom.</th>
                                    <th scope="col">Tipo Serv.</th>
                                    <th scope="col">Total</th>
                                    <th scope="col">Aus. Cli.</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    servicios.map(val => (
                                        <tr key={val.codigo}>
                                            <th>{val.codigo}</th>
                                            <td>{val.monto}</td>
                                            <td>{val.medio_pago}</td>
                                            <td>{val.estado}</td>
                                            <td>{val.adicional_adom}</td>
                                            <td>{val.tipoServicio?.tipo_servicio_codigo || 'N/A'}</td>
                                            <td>{val.total}</td>
                                            <td>{val.ausencia_cliente}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm" onClick={() => { setServicioSeleccionado(val); setEditar(true); }}>Editar</button>
                                                <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarServicio(val.codigo)}>Eliminar</button>
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

export default ServiciosPage;