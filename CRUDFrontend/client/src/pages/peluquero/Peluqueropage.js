import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import Swal from 'sweetalert2';


function PeluqueroList() {
    const [peluqueros, setPeluqueros] = useState([]);
    const [nombre, setNombre] = useState(''); 
    const [fecha_Ingreso, setFechaIngreso] = useState('');
    const [tipo, setTipo] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [editar, setEditar] = useState(false);
    const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState(null);
    const [alerta, setAlerta] = useState('');

    useEffect(() => {
        const fetchPeluqueros = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/peluqueros');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPeluqueros(data.data || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPeluqueros();
    }, []);

    //Formateo de fechas para mostrar en lista y en los campos al seleccionar "Editar"
    const formatFechaParaInput = (fechaISO) => {
        const fecha = new Date(fechaISO);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Los meses son 0-indexed
        const dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que el día tenga dos dígitos
        return `${anio}-${mes}-${dia}`; // Retorna en formato aaaa-mm-dd
    };

    useEffect(() => {
        if (peluqueroSeleccionado) {
            setNombre(peluqueroSeleccionado.nombre || '');
            setFechaIngreso(peluqueroSeleccionado.fecha_Ingreso ? formatFechaParaInput(peluqueroSeleccionado.fecha_Ingreso): '');
            setTipo(peluqueroSeleccionado.tipo || '');
        }
    }, [peluqueroSeleccionado]);


    const getPeluqueros = async () => {
        try {
            const response = await Axios.get('http://localhost:3000/api/peluqueros');
            const peluqueros = response.data.data;
            if (Array.isArray(peluqueros)) {
                setPeluqueros(peluqueros);
            }
        } catch (error) {
            console.error('Error al obtener los peluqueros:', error);
            setPeluqueros([]);
        }
    };

    const validateForm = () => {
        const errors = {};
        const today = new Date().toISOString().split('T')[0];

        if (!nombre) {
            errors.nombre = "El nombre es obligatorio.";
        } else if (nombre.length > 255) {
            errors.nombre = "El nombre no puede tener más de 255 caracteres.";
        }

        if (!fecha_Ingreso) {
            errors.fecha_Ingreso = "La fecha de ingreso es obligatoria.";
        } else if (fecha_Ingreso > today) {
            errors.fecha_Ingreso = "La fecha de ingreso no puede ser mayor a la fecha actual.";
        }

        if (!tipo) {
            errors.tipo = "El tipo es obligatorio.";
        } else if (tipo !== "Domicilio" && tipo !== "Sucursal") {
            errors.tipo = "El tipo debe ser 'Domicilio' o 'Sucursal'.";
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
                await Axios.put(`http://localhost:3000/api/peluqueros/${peluqueroSeleccionado.codigo_peluquero}`, {
                    nombre: nombre,
                    fecha_Ingreso: new Date(fecha_Ingreso).toISOString().split('T')[0],
                    tipo: tipo
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await Axios.post('http://localhost:3000/api/peluqueros', {
                    nombre: nombre,
                    fecha_Ingreso: new Date(fecha_Ingreso).toISOString().split('T')[0],
                    tipo: tipo
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Peluquero registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            getPeluqueros();
            resetForm();
        } catch (error) {
            console.error('Error al guardar el peluquero:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el peluquero.',
                confirmButtonText: 'Aceptar',
                position: 'center'
            });
        }
    };

    const resetForm = () => {
        setNombre("");
        setFechaIngreso("");
        setTipo("");
        setErrors({});
        setEditar(false);
        setPeluqueroSeleccionado(false);
    }

    const eliminarPeluquero = (codigo_peluquero) => {
        // Realiza una consulta para verificar si el peluquero tiene un turno asignado
        Axios.get(`http://localhost:3000/api/turnos?codigo_peluquero=${codigo_peluquero}`)
            .then(response => {
                console.log('Respuesta de la API de turnos:', response.data);
                const turnosAsignados = response.data;
    
                if (turnosAsignados.length > 0) {
                    // Si el peluquero tiene turnos asignados, mostrar alerta y detener eliminación
                    Swal.fire({
                        icon: 'error',
                        title: 'No se puede eliminar',
                        text: `No se puede eliminar el peluquero con código ${codigo_peluquero} porque tiene turnos asignados.`,
                        confirmButtonText: 'Aceptar'
                    });
                    console.log('Turnos asignados encontrados:', turnosAsignados);
                } else {
                    // Si no tiene turnos asignados, proceder con la eliminación
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
                            Axios.delete(`http://localhost:3000/api/peluqueros/${codigo_peluquero}`)
                                .then(() => {
                                    getPeluqueros();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Eliminado',
                                        text: 'El peluquero ha sido eliminado con éxito.',
                                        confirmButtonText: 'Aceptar'
                                    });
                                    console.log('Peluquero eliminado con éxito.');
                                })
                                .catch(error => {
                                    console.error('Error al eliminar el peluquero:', error);
                                    // Verifica si el error tiene un mensaje específico
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
                                            text: 'Error al eliminar el peluquero',
                                            confirmButtonText: 'Aceptar'
                                        });
                                    }
                                });
                        }
                    });
                }
            })
            .catch(error => {
                console.error('Error al verificar los turnos del peluquero:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al verificar los turnos del peluquero',
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
                    <h3>Gestión de Peluqueros</h3>
                </div>
    
                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                    <div className="form-container" style={{ padding: '20px', boxSizing: 'border-box' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Nombre y Apellido:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setNombre(event.target.value)}
                                        className="form-control"
                                        value={nombre || ""}
                                        placeholder="Nombre y Apellido"
                                    />
                                    {errors.nombre && <div className="text-danger">{errors.nombre}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Fecha de Ingreso:</label>
                                    <input
                                        type="date"
                                        onChange={(event) => setFechaIngreso(event.target.value)}
                                        className="form-control"
                                        value={fecha_Ingreso || ""}
                                    />
                                    {errors.fecha_Ingreso && <div className="text-danger">{errors.fecha_Ingreso}</div>}
                                </div>
                            </div>
    
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label">Tipo:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setTipo(event.target.value)}
                                        value={tipo || ""}
                                    >
                                        <option value="">Seleccione su tipo</option>
                                        <option value="Domicilio">Domicilio</option>
                                        <option value="Sucursal">Sucursal</option>
                                    </select>
                                    {errors.tipo && <div className="text-danger">{errors.tipo}</div>}
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
                                    <th scope="col">Nombre y Apellido</th>
                                    <th scope="col">Fecha de Ingreso</th>
                                    <th scope="col">Tipo</th>
                                    <th scope="col">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    peluqueros.map(val => (
                                        <tr key={val.codigo_peluquero}>
                                            <th>{val.codigo_peluquero}</th>
                                            <td>{val.nombre}</td>
                                            <td>{formatFechaParaInput(val.fecha_Ingreso)}</td>
                                            <td>{val.tipo}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm" onClick={() => { setPeluqueroSeleccionado(val); setEditar(true); }}>Editar</button>
                                                <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarPeluquero(val.codigo_peluquero)}>Eliminar</button>
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

export default PeluqueroList;
