import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import Swal from 'sweetalert2';


function PeluqueroList() {
    const [peluqueros, setPeluqueros] = useState([]);
    const [nombre, setNombre] = useState(''); 
    const [fecha_Ingreso, setFechaIngreso] = useState('');
    const [tipo, setTipo] = useState('');
    const [rol, setRol] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errors, setErrors] = useState({});
    const [editar, setEditar] = useState(false);
    const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState(null);
    const [alerta, setAlerta] = useState('');
    const accessToken = localStorage.getItem('accessToken'); // Obtener el token de acceso del localStorage

    useEffect(() => {
        const fetchPeluqueros = async () => {
            setLoading(true);
            try {
                const response = await Axios.get('http://localhost:3000/api/peluqueros', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                        }
                    });
                    const peluqueros = Array.isArray(response.data?.data) ? response.data.data : [];
                    setPeluqueros(peluqueros);
                    setError(null);
            } catch (error) {
                console.error('Error al obtener peluqueros:', error);
                setError(error.message || 'Error al obtener peluqueros');
            }finally{
                setLoading(false);
            };
        };
        fetchPeluqueros();
    }, [accessToken]);

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
            setEmail(peluqueroSeleccionado.email || '');
            setRol(peluqueroSeleccionado.rol || '');
            setPassword('');
        }
    }, [peluqueroSeleccionado]);


    const getPeluqueros = async () => {
        try {
            const response = await Axios.get('http://localhost:3000/api/peluqueros',{
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            const peluqueros = Array.isArray(response.data?.data) ? response.data.data : [];
            setPeluqueros(peluqueros);
        } catch (error) {
            console.error('Error al obtener los peluqueros:', error);
            setPeluqueros([]);
        };
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

        if(!rol){
            errors.rol = "El rol es obligatorio.";
        } else if(rol!== "peluquero" && rol !== "admin"){
            errors.rol = "El rol debe ser 'peluquero' o 'admin'.";
        };

        if(!email){
            errors.email = "El email es obligatorio.";
        };

        if(!password && !editar){
            errors.password = "La contraseña es obligatoria.";
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
                const dataToSend = {
                    nombre,
                    fecha_Ingreso: new Date(fecha_Ingreso).toISOString().split('T')[0],
                    tipo,
                    rol,
                    email,
                };
            
                if (password) {
                    dataToSend.password = password;
                };
            
                await Axios.put(
                    `http://localhost:3000/api/peluqueros/${peluqueroSeleccionado.codigo_peluquero}`,
                    dataToSend,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                );
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
                    tipo: tipo,
                    rol: rol,
                    email: email,
                    password: password
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
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
        setRol("");
        setEmail("");
        setErrors({});
        setEditar(false);
        setPeluqueroSeleccionado(null);
    };

    const eliminarPeluquero = (codigo_peluquero) => {
        // Realiza una consulta para verificar si el peluquero tiene un turno asignado
        Axios.get(`http://localhost:3000/api/turnos?codigo_peluquero=${codigo_peluquero}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
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
                            Axios.delete(`http://localhost:3000/api/peluqueros/${codigo_peluquero}`, {
                                headers: {
                                    Authorization: `Bearer ${accessToken}`
                                }
                            })
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
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1200px' }}>
                <div className="card-header text-center bg-primary text-white py-3">
                    <h3 className="mb-0">Gestion de Peluqueros</h3>
                </div>
    
                <div className="card-body d-flex flex-column p-0">
                    {/* Formulario en la parte superior */}
                    <div className="p-4 border-bottom">
                        <form onSubmit={handleSubmit}>
                            <div className="row g-3">
                                {/* Primera fila - Información básica */}
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-bold">Nombre y Apellido:</label>
                                        <input
                                            type="text"
                                            onChange={(event) => setNombre(event.target.value)}
                                            className="form-control"
                                            value={nombre || ""}
                                            placeholder="Nombre completo"
                                        />
                                        {errors.nombre && <div className="text-danger small mt-1">{errors.nombre}</div>}
                                    </div>
                                </div>
    
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-bold">Fecha de Ingreso:</label>
                                        <input
                                            type="date"
                                            onChange={(event) => setFechaIngreso(event.target.value)}
                                            className="form-control"
                                            value={fecha_Ingreso || ""}
                                        />
                                        {errors.fecha_Ingreso && <div className="text-danger small mt-1">{errors.fecha_Ingreso}</div>}
                                    </div>
                                </div>
    
                                {/* Segunda fila - Tipo y Rol */}
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-bold">Tipo:</label>
                                        <select
                                            className="form-select"
                                            onChange={(event) => setTipo(event.target.value)}
                                            value={tipo || ""}
                                        >
                                            <option value="">Seleccione tipo</option>
                                            <option value="Domicilio">Domicilio</option>
                                            <option value="Sucursal">Sucursal</option>
                                        </select>
                                        {errors.tipo && <div className="text-danger small mt-1">{errors.tipo}</div>}
                                    </div>
                                </div>
    
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-bold">Rol:</label>
                                        <select
                                            className="form-select"
                                            onChange={(event) => setRol(event.target.value)}
                                            value={rol || ""}
                                        >
                                            <option value="">Seleccione rol</option>
                                            <option value="peluquero">Peluquero</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                        {errors.rol && <div className="text-danger small mt-1">{errors.rol}</div>}
                                    </div>
                                </div>
    
                                {/* Tercera fila - Credenciales */}
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-bold">Email:</label>
                                        <input
                                            type="email"
                                            onChange={(event) => setEmail(event.target.value)}
                                            className="form-control"
                                            value={email || ""}
                                            placeholder="usuario@ejemplo.com"
                                        />
                                        {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                                    </div>
                                </div>
    
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <label className="form-label fw-bold">Contraseña:</label>
                                        <input
                                            type="password"
                                            onChange={(event) => setPassword(event.target.value)}
                                            className="form-control"
                                            value={password || ""}
                                            required
                                            placeholder="••••••••"
                                        />
                                        {errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
                                    </div>
                                </div>
    
                                {/* Botones de acción */}
                                <div className="col-12 mt-4">
                                    <div className="d-flex justify-content-center gap-3">
                                        {editar ? (
                                            <>
                                                <button type="submit" className="btn btn-warning px-4">
                                                    <i className="bi bi-pencil-square me-2"></i>Actualizar
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-secondary px-4"
                                                    onClick={() => {setEditar(false); resetForm();}}
                                                >
                                                    Cancelar
                                                </button>
                                            </>
                                        ) : (
                                            <button type="submit" className="btn btn-success px-4">
                                                <i className="bi bi-person-plus me-2"></i>Registrar
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
    
                    {/* Tabla en la parte inferior */}
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-hover mb-0">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th scope="col" className="w-10">Código</th>
                                    <th scope="col" className="w-25">Nombre</th>
                                    <th scope="col" className="w-15">Ingreso</th>
                                    <th scope="col" className="w-15">Tipo</th>
                                    <th scope="col" className="w-20">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {peluqueros.map(val => (
                                    <tr key={val.codigo_peluquero}>
                                        <td className="fw-semibold">{val.codigo_peluquero}</td>
                                        <td>{val.nombre}</td>
                                        <td>{formatFechaParaInput(val.fecha_Ingreso)}</td>
                                        <td>
                                            <span className={`badge ${val.tipo === 'Domicilio' ? 'bg-info' : 'bg-primary'}`}>
                                                {val.tipo}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button 
                                                    className="btn btn-sm btn-outline-primary"
                                                    onClick={() => { setPeluqueroSeleccionado(val); setEditar(true); }}
                                                >
                                                    <i className="bi bi-pencil"></i>Editar
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger" 
                                                    onClick={() => eliminarPeluquero(val.codigo_peluquero)}
                                                >
                                                    <i className="bi bi-trash"></i>Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
    
            {/* Alerta flotante */}
            {alerta.mensaje && (
                <div className={`alert alert-${alerta.tipo} alert-dismissible fade show`} 
                    role="alert" 
                    style={{ 
                        position: 'fixed', 
                        bottom: '20px', 
                        right: '20px', 
                        width: 'auto',
                        minWidth: '300px',
                        zIndex: 1050 
                    }}>
                    <div className="d-flex align-items-center">
                        <i className={`bi ${alerta.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                        <div>{alerta.mensaje}</div>
                        <button 
                            type="button" 
                            className="btn-close ms-auto" 
                            onClick={() => setAlerta({ tipo: '', mensaje: '' })}
                        ></button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PeluqueroList;
