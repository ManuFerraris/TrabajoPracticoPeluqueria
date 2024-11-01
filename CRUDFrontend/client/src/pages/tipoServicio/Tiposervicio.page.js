import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import Swal from 'sweetalert2';

function TipoServicioPage(){
    const [TipoServicio, setTipoServicio] = useState([]);
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [duracion_estimada, setDuracion_estimada] = useState('');
    const [precio_base, setPrecio_base] = useState('');
    const [servicio_codigo, setservicio_codigo] = useState('');
    const [error, setError] = useState('')
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [TSseleccionado, setTsseleccionado] = useState(null);
    const [editar, setEditar] = useState(false);
    const [alerta, setAlerta] = useState('');


    useEffect(() => {
        const fetchTipoServicio = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/tiposervicio');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setTipoServicio(data.data || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchTipoServicio();
    }, []);

    useEffect(() => {
        if (TSseleccionado) {
            setNombre(TSseleccionado.nombre || '');
            setDescripcion(TSseleccionado.descripcion || '');
            setDuracion_estimada(TSseleccionado.duracion_estimada || '');
            setPrecio_base(TSseleccionado.precio_base || '');
            setservicio_codigo(TSseleccionado.servicio?.codigo || '');
            console.log("TSseleccionado:", TSseleccionado);  // Verifica todo el objeto
            console.log("Tipo de TSseleccionado:", typeof TSseleccionado);
            console.log("servicio_codigo en TSseleccionado:", TSseleccionado?.servicio_codigo);
        }
    }, [TSseleccionado]);

    const getTipoServicio = async () => {
        try {
            const response = await Axios.get('http://localhost:3000/api/tiposervicio');
            const tipo_ser = response.data.data;
            if (Array.isArray(tipo_ser)) {
                setTipoServicio(tipo_ser);
            }
        } catch (error) {
            console.error('Error al obtener los Tipos de Servicio:', error);
            setTipoServicio([]);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!nombre) {
            errors.nombre = "El nombre es obligatorio.";
        } else if (nombre.length > 255) {
            errors.nombre = "El nombre no puede tener más de 255 caracteres.";
        }

        if (!descripcion) {
            errors.descripcion = "La descripcion es obligatoria.";
        }
        if(!servicio_codigo){
            errors.servicio_codigo = "El codigo del Servicio es obligatorio"
        }
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
                await Axios.put(`http://localhost:3000/api/tiposervicio/${TSseleccionado.codigo_tipo}`, {
                    nombre: nombre,
                    descripcion: descripcion,
                    duracion_estimada: duracion_estimada,
                    precio_base: precio_base,
                    servicio_codigo: servicio_codigo
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await Axios.post('http://localhost:3000/api/tiposervicio', {
                    nombre: nombre,
                    descripcion: descripcion,
                    duracion_estimada: duracion_estimada,
                    precio_base: precio_base,
                    servicio_codigo: servicio_codigo
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Tipo de Servicio registrada',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            await getTipoServicio();
            resetForm();
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el tipo de servicio.',
                confirmButtonText: 'Aceptar',
                position: 'center'
            });
        }
    }

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setDuracion_estimada('');
        setPrecio_base('');
        setservicio_codigo('');
        setTsseleccionado(null);
        setEditar(false);
        setErrors({});
    }

    const eliminarTipoServicio = (codigo_tipo) => {
        // Consulta si el tipo de servicio tiene algun servicio 
        Axios.get(`http://localhost:3000/api/tiposervicio?codigo_tipo=${codigo_tipo}`)
            .then(response => {
                const TPasignado = response.data;
    
                if (TPasignado.length > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se puede eliminar',
                        text: `No se puede eliminar el Tipo de Servicio con código ${codigo_tipo} porque tiene servicios asignados.`,
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
                        confirmButtonText: 'Sí, eliminarla'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Axios.delete(`http://localhost:3000/api/tiposervicio/${codigo_tipo}`)
                                .then(() => {
                                    getTipoServicio();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Eliminada',
                                        text: 'El tipo de servicio ha sido eliminado con éxito.',
                                        confirmButtonText: 'Aceptar'
                                    });
                                })
                                .catch(error => {
                                    console.error('Error al eliminar el Tipo de servicio:', error);
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
                                            text: 'Error al eliminar el Tipo de servicio',
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
                    text: 'Error al verificar los servicios del Tipo de Servicio',
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
                    <h3>Alta de Tipos de Servicios</h3>
                </div>
    
                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                    <div className="form-container" style={{ padding: '20px', boxSizing: 'border-box' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">

                                <div className="col-md-6">
                                    <label className="form-label">Nombre del Tipo de Servicio:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setNombre(event.target.value)}
                                        className="form-control"
                                        value={nombre || ""}
                                        placeholder="Nombre Tipo Servicio"
                                    />
                                    {errors.nombre && <div className="text-danger">{errors.nombre}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Descripcion:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setDescripcion(event.target.value)}
                                        className="form-control"
                                        value={descripcion || ""}
                                        placeholder="Ingrese una descripcion"
                                    />
                                    {errors.descripcion && <div className="text-danger">{errors.descripcion}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Codigo del Servicio:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setservicio_codigo(event.target.value)}
                                        className="form-control"
                                        value={servicio_codigo || ""}
                                        placeholder="Codigo del Servicio"
                                    />
                                    {errors.servicio_codigo && <div className="text-danger">{errors.servicio_codigo}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Precio base:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setPrecio_base(event.target.value)}
                                        className="form-control"
                                        value={precio_base || ""}
                                        placeholder="Precio base"
                                    />
                                    {errors.precio_base && <div className="text-danger">{errors.precio_base}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Duracion estimada:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setDuracion_estimada(event.target.value)}
                                        className="form-control"
                                        value={duracion_estimada || ""}
                                        placeholder="Duracion estimada"
                                    />
                                    {errors.duracion_estimada && <div className="text-danger">{errors.duracion_estimada}</div>}
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
    
                    <div className="table-container" style={{ flex: 1, overflowY: 'auto', marginTop: '20px' }}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th scope="col">Código</th>
                                    <th scope="col">Código Serv.</th>
                                    <th scope="col">Nombre Servicio</th>
                                    <th scope="col">Descripcion</th>
                                    <th scope="col">Duracion Estimada</th>
                                    <th scope="col">Precio base</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    TipoServicio.map(val => (
                                        <tr key={val.codigo_tipo}>
                                            <th>{val.codigo_tipo}</th>
                                            <th>{val.servicio?.codigo || 'N/A'}</th>
                                            <th>{val.nombre}</th>
                                            <td>{val.descripcion}</td>
                                            <td>{val.duracion_estimada}</td>
                                            <td>{val.precio_base}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm" onClick={() => { setTsseleccionado(val); setEditar(true); }}>Editar</button>
                                                <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarTipoServicio(val.codigo_tipo)}>Eliminar</button>
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

export default TipoServicioPage;