import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../auth/constants.ts';
import { useCallback } from 'react';

type Cliente = {
    codigo_cliente:number;
    dni: string;
    NomyApe: string;
    email: string;
    direccion: string;
    telefono: string;
    codigo_localidad: string;
    estado: string;
    rol: 'cliente';
    localidad: string;
};

type Alerta = {
    tipo: 'success' | 'error' | 'info' | '';
    mensaje: string;
};

type Localidad = {
    codigo: number;
    nombre: string;
    provincia: string;
    codigo_postal: string;
    pais: 'Argentina' | 'Uruguay';
    descripcion: string;
    cliente?: Cliente
};

type FormErrors = {
    dni?:string;
    NomyApe?:string;
    direccion?:string;
    codigo_localidad?:string;
    [ key:string ]: string | undefined;
};

type ClientePayload = {
    dni: string;
    NomyApe: string;
    email: string;
    direccion: string;
    telefono: string;
    codigo_localidad: string;
    password?: string;
};

function ClientesPage(){
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [localidades, setLocalidades] = useState<Localidad[]>([]);
    const [/*localidad*/, setLocalidad] = useState<Localidad | null>(null);
    const [dni, setDni] = useState<string>('');
    const [NomyApe, setNomyape] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [direccion, setDireccion] = useState<string>('');
    const [telefono, setTelefono] = useState<string>('');
    const [codigo, setCodigo_Localidad] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [/*estado*/, setEstado] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({}); // validateForm
    const [loading, setLoading] = useState<boolean>(false);
    const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
    const [editar, setEditar] = useState<boolean>(false);
    const [alerta, setAlerta] = useState<Alerta>({ tipo: '', mensaje: '' });

    const accessToken = localStorage.getItem('accessToken');

    const loadClientes = useCallback(async ():Promise<void> => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_URL}/clientes`, {
                headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
                }
            });
            const clientes = response.data.data || [];

            //console.log('Clientes traidos del backend: ', clientes);
            setClientes(clientes);

        } catch (error:any) {
            console.error('Error al obtener las clientes:', error);
            setError(error.response?.data?.message || error.message);
            setClientes([]);
        }finally{
            setLoading(false);
        };
    }, [accessToken]);

    useEffect(() => {
        loadClientes()
    }, [accessToken, loadClientes]);

    useEffect(() => {
        const fetchLocalidades = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/localidades`, {
                    headers: { Authorization: `Bearer ${accessToken}` }}
                );
                const localidades = response.data.data || [];
                //console.log('Localidades traidas del backend: ', localidades);
                setLocalidades(localidades);
            } catch (error:any) {
                console.error('Error al obtener las localidades:', error);
                setError(error.response?.data?.message || error.message);
            }finally{
                setLoading(false);
            };
        };
        fetchLocalidades();
    }, [accessToken]);

    const fetchLocalidad = useCallback(async () => {
        if (!clienteSeleccionado?.codigo_localidad) return;
        try{
        const res = await axios.get(`${API_URL}/localidades/${clienteSeleccionado?.codigo_localidad}`,{
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const localidadCompleta = res.data.data;
            //console.log('Localidad traida: ', localidadCompleta);
            setLocalidad(localidadCompleta);
        }catch(error: any){
            console.error('Error al obtener la localidad: ', error);
        };
    }, [clienteSeleccionado, accessToken]);

    useEffect(() => {
        if (clienteSeleccionado) {
            //console.log('Datos cliente seleccionado: ', clienteSeleccionado);
            setDni(clienteSeleccionado?.dni ?? '');
            setNomyape(clienteSeleccionado?.NomyApe ?? '');
            setEmail(clienteSeleccionado?.email ?? '');
            setDireccion(clienteSeleccionado?.direccion ?? '');
            setTelefono(clienteSeleccionado?.telefono ?? '');
            setCodigo_Localidad(clienteSeleccionado?.localidad?.toString() ?? '');
            setEstado(clienteSeleccionado?.estado ?? '');
            setPassword('');
        };
    }, [clienteSeleccionado]);

    useEffect(() => {
        if (codigo) {
            fetchLocalidad();
        }
    }, [codigo, fetchLocalidad]);

    const resetForm = () => {
        setDni('');
        setNomyape('');
        setEmail('');
        setDireccion('');
        setTelefono('');
        setCodigo_Localidad('');
        setErrors({});
        setEditar(false);
        setClienteSeleccionado(null);
    };

    const validateForm = () => {
        const errors: FormErrors = {};

        if (!dni) {
            errors.dni = "El DNI es obligatorio.";
        } else if (dni.length > 9) {
            errors.dni = "El DNI no puede tener más de 8 caracteres.";
        };

        if (!NomyApe) {
            errors.NomyApe = "El nombre y apellido es obligatiorio.";
        } else if(NomyApe.length > 40){
            errors.NomyApe = "El nombre y apellido no puede tener mas de 40 Caracteres";
        };

        if (!direccion) {
            errors.direccion = "La direccion es obligatoria.";
        };

        if(!codigo){
            errors.codigo = "El codigo de la localidad es obligatorio";
        };
        
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        //console.log("handleSubmit fue ejecutado");
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            if (editar) {
                const dataToSend: ClientePayload = {
                    dni,
                    NomyApe,
                    email,
                    direccion,
                    telefono,
                    codigo_localidad: codigo
                };
                if(password){
                    dataToSend.password = password;
                };
                if(!clienteSeleccionado){
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se ha seleccionado un cliente para editar.',
                        confirmButtonText: 'Aceptar',
                        position: 'center'
                    });
                    return;
                };        
                await axios.put(`${API_URL}/clientes/${clienteSeleccionado.codigo_cliente}`,
                    dataToSend, { headers: { Authorization: `Bearer ${accessToken}` } }
                );
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await axios.post(`${API_URL}/clientes`, {
                    dni: dni,
                    NomyApe: NomyApe,
                    email: email,
                    direccion: direccion,
                    telefono: telefono,
                    codigo_localidad: codigo,
                    password: password
                }, { headers: { Authorization: `Bearer ${accessToken}` } });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Cliente registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            loadClientes();
            resetForm();
        }catch (error) {
            console.error('Error al guardar el cliente:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el Cliente.',
                confirmButtonText: 'Aceptar',
                position: 'center'
            });
        };
    };

    const eliminarCliente = async (codigo_cliente: string) => {
        try{
            // Consulta si la cliente tiene algun turno guardado
            //console.log("Codigo de cliente enviado: ", codigo_cliente);
            const response = await axios.get(`${API_URL}/clientes/misTurnosActivos/${codigo_cliente}`, {
                headers: { Authorization: `Bearer ${accessToken}` } } );
            
            if (response.status === 404) {
                Swal.fire({
                    icon: 'error',
                    title: 'No se puede eliminar',
                    text: response.data.message,
                    confirmButtonText: 'Aceptar'
                });
                return;
            };
            if(Array.isArray(response.data) && response.data.length > 0){
                Swal.fire({
                    icon: 'error',
                    title: 'No se puede eliminar',
                    text: 'El cliente tiene turnos asignados',
                    confirmButtonText: 'Aceptar'
                });
                return;
            };

            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: 'No podrás revertir esta acción',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminarlo'
            });

            if (result.isConfirmed) {
                await axios.delete(`${API_URL}/clientes/${codigo_cliente}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                loadClientes();

                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El cliente ha sido eliminado con éxito.',
                    confirmButtonText: 'Aceptar'
                });

                //console.log('Cliente eliminado con éxito.');
            };
        }catch (error: any) {
            console.error('Error al eliminar el cliente:', error);
        
            const errorMessage =error.response?.data?.message || 'Error al eliminar el cliente';
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'Aceptar'
            });
        };
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
                                        value={codigo || ""}
                                        onChange={(event) => setCodigo_Localidad(event.target.value)}
                                        className="form-control"
                                    >
                                        <option value="">Seleccione una localidad</option>
                                        {localidades.map(loc => (
                                            <option key={loc.codigo} value={loc.codigo}>
                                                {loc.nombre}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.codigo && <div className="text-danger">{errors.codigo}</div>}
                                </div>

                                <div>
                                    <div className="col-md-6">
                                        <label className="form-label">Contraseña:</label>
                                        <input
                                            type="text"
                                            onChange={(event) => setPassword(event.target.value)}
                                            className="form-control"
                                            value={password || ""}
                                            placeholder="Contraseña"
                                        />
                                    </div>
                                </div>

                            </div>

                            <div className="text-center">
                                {
                                    editar ?
                                        <div>
                                            <button type="submit" className='btn btn-warning m-2'>Actualizar</button>
                                            <button type="button" className='btn btn-secondary m-2' onClick={() => {setEditar(false); resetForm()}}>Cancelar</button>
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
                                    <th scope="col">Estado</th>
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
                                            <td>{val.estado}</td>
                                            <td>{val.email}</td>
                                            <td>{val.direccion}</td>
                                            <td>{val.telefono}</td>
                                            <td>
                                                <button className="btn btn-primary btn-sm" onClick={() => { setClienteSeleccionado(val); setEditar(true); }}>Editar</button>
                                                <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarCliente(String(val.codigo_cliente))}>Eliminar</button>
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
};

export default ClientesPage;