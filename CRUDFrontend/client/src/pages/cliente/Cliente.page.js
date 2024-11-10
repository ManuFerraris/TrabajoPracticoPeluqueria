import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Axios from 'axios';
import Swal from 'sweetalert2';

function ClientesPage(){
    const [clientes, setClientes] = useState([]);
    const [dni, setDni] = useState('');
    const [NomyApe, setNomyape] = useState('');
    const [email, setEmail] = useState('');
    const [direccion, setDireccion] = useState('');
    const [telefono, setTelefono] = useState('');
    const [codigo_localidad, setCodigo_Localidad] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState('');
    const [loading, setLoading] = useState('');
    const [clienteSeleccionado, setClienteSeleccionado] = useState('');
    const [editar, setEditar] = useState(false);
    const [alerta, setAlerta] = useState({ tipo: '', mensaje: '' });
    const [localidades, setLocalidades] = useState([]);

    useEffect(() => {
        const fetchClientes = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/clientes');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setClientes(data.data || []);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchClientes();
    }, []);

    useEffect(() => {
        const fetchLocalidades = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/localidades');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setLocalidades(data.data || []); 
            } catch (error) {
                console.error('Error al obtener las localidades:', error);
            }
        };
        fetchLocalidades();
    }, []);

    useEffect(() => {
        if (clienteSeleccionado) {
            setDni(clienteSeleccionado.dni || '');
            setNomyape(clienteSeleccionado.NomyApe || '');
            setEmail(clienteSeleccionado.email || '');
            setDireccion(clienteSeleccionado.direccion || '');
            setTelefono(clienteSeleccionado.telefono || '');
            setCodigo_Localidad(clienteSeleccionado.codigo_localidad || '');
        }
    }, [clienteSeleccionado]);

    const getClientes = async () => {
        try {
            const response = await Axios.get('http://localhost:3000/api/clientes');
            const clientes = response.data.data;
            if (Array.isArray(clientes)) {
                setClientes(clientes);
            }
        } catch (error) {
            console.error('Error al obtener las clientes:', error);
            setClientes([]);
        }
    };

    const validateForm = () => {
        const errors = {};

        if (!dni) {
            errors.dni = "El DNI es obligatorio.";
        } else if (dni.length > 9) {
            errors.dni = "El DNI no puede tener más de 8 caracteres.";
        }

        if (!NomyApe) {
            errors.NomyApe = "El nombre y apellido es obligatiorio.";
        } else if(NomyApe.length > 40){
            errors.NomyApe = "El nombre y apellido no puede tener mas de 40 Caracteres"
        }

        if (!direccion) {
            errors.direccion = "La direccion es obligatoria.";
        }

        if(!codigo_localidad){
            errors.codigo_localidad = "El codigo de la localidad es obligatorio"
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
                await Axios.put(`http://localhost:3000/api/clientes/${clienteSeleccionado.codigo_cliente}`, {
                    dni: dni,
                    NomyApe: NomyApe,
                    email: email,
                    direccion: direccion,
                    telefono: telefono,
                    codigo_localidad: codigo_localidad
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await Axios.post('http://localhost:3000/api/clientes', {
                    dni: dni,
                    NomyApe: NomyApe,
                    email: email,
                    direccion: direccion,
                    telefono: telefono,
                    codigo_localidad: codigo_localidad
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Cliente registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            getClientes();
            setDni("");
            setNomyape("");
            setEmail("");
            setDireccion("");
            setTelefono("");
            setCodigo_Localidad("");
            setErrors({});
            setEditar(false);
        } catch (error) {
            console.error('Error al guardar el cliente:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el Cliente.',
                confirmButtonText: 'Aceptar',
                position: 'center'
            });
        }
    }

    const eliminarCliente = (codigo_cliente) => {
        // Consulta si la cliente tiene algun turno guardado
        Axios.get(`http://localhost:3000/api/turnos?codigo_cliente=${codigo_cliente}`)
            .then(response => {
                const turnosAsignados = response.data;
    
                if (turnosAsignados.length > 0) {
                    Swal.fire({
                        icon: 'error',
                        title: 'No se puede eliminar',
                        text: `No se puede eliminar el cliente con código ${codigo_cliente} porque tiene turno/s asignado/s.`,
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
                            Axios.delete(`http://localhost:3000/api/clientes/${codigo_cliente}`)
                                .then(() => {
                                    getClientes();
                                    Swal.fire({
                                        icon: 'success',
                                        title: 'Eliminado',
                                        text: 'El cliente ha sido eliminado con éxito.',
                                        confirmButtonText: 'Aceptar'
                                    });
                                })
                                .catch(error => {
                                    console.error('Error al eliminar el cliente:', error);
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
                                            text: 'Error al eliminar el cliente',
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
                    text: 'Error al verificar los turnos del cliente',
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
                    <h3>Alta de Clientes</h3>
                </div>
    
                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'hidden' }}>
                    <div className="form-container" style={{ padding: '20px', boxSizing: 'border-box' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">

                                <div className="col-md-6">
                                    <label className="form-label">Nombre y Apellido:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setNomyape(event.target.value)}
                                        className="form-control"
                                        value={NomyApe || ""}
                                        placeholder="Nombre y Apellido"
                                    />
                                    {errors.NomyApe && <div className="text-danger">{errors.NomyApe}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Nro. de Documento:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setDni(event.target.value)}
                                        className="form-control"
                                        value={dni || ""}
                                        placeholder="Nro. de Documento"
                                    />
                                    {errors.dni && <div className="text-danger">{errors.dni}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Email:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="form-control"
                                        value={email || ""}
                                        placeholder="Direccion de email (opcional)"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Direccion:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setDireccion(event.target.value)}
                                        className="form-control"
                                        value={direccion || ""}
                                        placeholder="Direccion"
                                    />
                                    {errors.direccion && <div className="text-danger">{errors.direccion}</div>}
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label">Telefono:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setTelefono(event.target.value)}
                                        className="form-control"
                                        value={telefono || ""}
                                        placeholder="Telefono (opcional)"
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Localidad:</label>
                                    <select
                                        onChange={(event) => setCodigo_Localidad(event.target.value)}
                                        className="form-control"
                                        value={codigo_localidad || ""}
                                    >
                                        <option value="">Seleccione una localidad</option>
                                        {localidades.map(localidad => (
                                            <option key={localidad.codigo} value={localidad.codigo}>
                                                {localidad.nombre} {/* Ajusta este campo según el nombre del atributo en tu entidad Localidad */}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.codigo_localidad && <div className="text-danger">{errors.codigo_localidad}</div>}
                                </div>

                            </div>

                            <div className="text-center">
                                {
                                    editar ?
                                        <div>
                                            <button type="submit" className='btn btn-warning m-2'>Actualizar</button>
                                            <button type="button" className='btn btn-secondary m-2' onClick={() => setEditar(false)}>Cancelar</button>
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
                                    <th scope="col">Nombre y Apellido</th>
                                    <th scope="col">DNI</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">Direccion</th>
                                    <th scope="col">Telefono</th>
                                    <th scope="col">Acciones</th>

                                </tr>
                            </thead>
                            <tbody>
                                {
                                    clientes.map(val => (
                                        <tr key={val.codigo_cliente}>
                                            <th>{val.codigo_cliente}</th>
                                            <td>{val.NomyApe}</td>
                                            <td>{val.dni}</td>
                                            <td>{val.email}</td>
                                            <td>{val.direccion}</td>
                                            <td>{val.telefono}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm" onClick={() => { setClienteSeleccionado(val); setEditar(true); }}>Editar</button>
                                                <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarCliente(val.codigo_cliente)}>Eliminar</button>
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

export default ClientesPage;