import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../auth/constants.ts';

type Localidad = {
    codigo: number;
    nombre: string;
    provincia: string;
    codigo_postal: string;
    pais: 'Argentina' | 'Uruguay';
    descripcion: string;
};

type FormErrors = {
    nombre?: string;
    provincia?: string;
    codigo_postal?: string;
    pais?: string;
    descripcion?: string;
};

type Alerta = {
    tipo: string;
    mensaje: string;
};

function LocalidadesPage(){
    const [localidades, setLocalidades] = useState<Localidad[]>([]);
    const [nombre, setNombre] = useState<string>('');
    const [provincia, setProvincia] = useState<string>('');
    const [codigo_postal, setCodigo_postal] = useState<string>('');
    const [pais, setPais] = useState<'Argentina' | 'Uruguay' | ''>('');
    const [descripcion, setDescripcion] = useState<string>('');

    const [error, setError] = useState<string>('')
    const [errors, setErrors] = useState<FormErrors>({})
    const [loading, setLoading] = useState<boolean>(false)
    const [localidadSeleccionada, setLocalidadSeleccionada] = useState<Localidad | null>(null);
    const [editar, setEditar] = useState<boolean>(false);
    const [alerta, setAlerta] = useState<Alerta>({ tipo: '', mensaje: '' });

    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchLocalidades = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/localidades`);
                const data = response.data;
                setLocalidades(data.data || []);
            } catch (error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchLocalidades();
    }, []);

    useEffect(() => {
        if (localidadSeleccionada) {
            setNombre(localidadSeleccionada.nombre || '');
            setProvincia(localidadSeleccionada.provincia || '');
            setCodigo_postal(localidadSeleccionada.codigo_postal || '');
            setPais(localidadSeleccionada.pais || '');
            setDescripcion(localidadSeleccionada.descripcion || '');
        };
    }, [localidadSeleccionada]);

    const getLocalidades = async ():Promise<void> => {
        try {
            const response = await axios.get(`${API_URL}/localidades`);
            const localidades = response.data.data;
            if (Array.isArray(localidades)) {
                setLocalidades(localidades);
            }
        } catch (error) {
            console.error('Error al obtener las Localidades:', error);
            setLocalidades([]);
        }
    };

    const validateForm = () => {
        const errors:FormErrors = {};

        if (!nombre) {
            errors.nombre = "El nombre es obligatorio.";
        } else if (nombre.length > 30) {
            errors.nombre = "El nombre no puede tener más de 255 caracteres.";
        };

        if (!provincia) {
            errors.provincia = "La provincia es obligatoria.";
        };

        if (!pais) {
            errors.pais = "El pais es obligatorio.";
        } else if (pais !== 'Argentina' && pais !== 'Uruguay'){
            errors.pais = "Debe seleccionar un pais"
        };

        if (!codigo_postal) {
            errors.codigo_postal = "El codigo postal es obligatorio.";
        };

        if (!descripcion) {
            errors.descripcion = "La descripcion es obligatoria.";
        } else if (descripcion.length > 80) {
            errors.descripcion = "La descripcion no puede tener más de 80 caracteres.";
        }
        return errors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        };

        try {
            const payload = { nombre, provincia, codigo_postal, pais, descripcion };
            if (editar && localidadSeleccionada) {
                await axios.put(`${API_URL}/localidades/${localidadSeleccionada.codigo}`, payload);
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Actualización exitosa',
                    showConfirmButton: false,
                    timer: 1500
                });
            } else {
                await axios.post(`${API_URL}/localidades`, payload);
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Localidad registrada',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            await getLocalidades();
            resetForm();
        } catch (error: any) {
            console.error('Error al guardar guardar la localidad:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar la localidad.',
                confirmButtonText: 'Aceptar',
                position: 'center'
            });
        };
    };

    const resetForm = (): void => {
        setNombre('');
        setProvincia('');
        setCodigo_postal('');
        setDescripcion('');
        setPais('');
        setErrors({});
        setEditar(false);
        setLocalidadSeleccionada(null);
    };

    const eliminarLocalidad = async (codigo:string):Promise<void> => {
        try{
            //console.log('Codigo de localidad recibido: ', codigo);
            const response = await axios.get(`${API_URL}/localidades/misClientes/${codigo}`, {
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

            if(Array.isArray(response.data.data) && response.data.data.length > 0){
                Swal.fire({
                    icon: 'error',
                    title: 'No se puede eliminar',
                    text: 'La localidad tiene clientes asignados',
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
                confirmButtonText: 'Sí, eliminarla'
            });

            if (result.isConfirmed) {
                await axios.delete(`${API_URL}/localidades/${codigo}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                getLocalidades();

                Swal.fire({
                    icon: 'success',
                    title: 'Eliminada',
                    text: 'La localidad ha sido eliminada con éxito.',
                    confirmButtonText: 'Aceptar'
                });
                //console.log('Localidad eliminado con éxito.');
            };
        }catch(error:any){
            console.error('Error al eliminar la localidad:', error);
            const errorMessage = error.response?.data?.message || 'Error al eliminar la localidad.';
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
                    <h3>Alta de localidades</h3>
                </div>
    
                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                    <div className="form-container" style={{ padding: '20px', boxSizing: 'border-box' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">

                                <div className="col-md-6">
                                    <label className="form-label">Nombre localidad:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setNombre(event.target.value)}
                                        className="form-control"
                                        value={nombre || ""}
                                        placeholder="Nombre localidad"
                                    />
                                    {errors.nombre && <div className="text-danger">{errors.nombre}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Provincia:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setProvincia(event.target.value)}
                                        className="form-control"
                                        value={provincia || ""}
                                        placeholder="Nombre provincia"
                                    />
                                    {errors.provincia && <div className="text-danger">{errors.provincia}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Pais:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setPais(event.target.value as '' | 'Argentina' | 'Uruguay')}
                                        value={pais || ""}
                                        
                                    >
                                        <option value="">Seleccione el pais</option>
                                        <option value="Argentina">Argentina</option>
                                        <option value="Uruguay">Uruguay</option>
                                    </select>
                                    {errors.pais && <div className="text-danger">{errors.pais}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Codigo Postal:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setCodigo_postal(event.target.value)}
                                        className="form-control"
                                        value={codigo_postal || ""}
                                        placeholder="Codigo Postal"
                                    />
                                    {errors.codigo_postal && <div className="text-danger">{errors.codigo_postal}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Descripcion:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setDescripcion(event.target.value)}
                                        className="form-control"
                                        value={descripcion || ""}
                                        placeholder="Descripcion (opcional)"
                                    />
                                    {errors.descripcion && <div className="text-danger">{errors.descripcion}</div>}
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
    
                    <div className="table-container" style={{ flex: 1, overflowY: 'auto', marginTop: '20px' }}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th scope="col">Código</th>
                                    <th scope="col">Nombre Localidad</th>
                                    <th scope="col">Codigo Postal</th>
                                    <th scope="col">Provincia</th>
                                    <th scope="col">Pais</th>
                                    <th scope="col">Descripcion</th>
                                    <th scope="col">Acciones</th>

                                </tr>
                            </thead>
                            <tbody>
                                {
                                    localidades.map(val => (
                                        <tr key={val.codigo}>
                                            <th>{val.codigo}</th>
                                            <td>{val.nombre}</td>
                                            <td>{val.codigo_postal}</td>
                                            <td>{val.provincia}</td>
                                            <td>{val.pais}</td>
                                            <td>{val.descripcion}</td>
                                            <td>
                                                <div className = "d-flex justify-content-between">
                                                    <button className="btn btn-primary btn-sm" onClick={() => { setLocalidadSeleccionada(val); setEditar(true); }}>Editar</button>
                                                    <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarLocalidad(String(val.codigo))}>Eliminar</button>
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

export default LocalidadesPage;