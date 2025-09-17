import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../auth/constants.ts';

type TipoServicio = {
    codigo_tipo: number;
    nombre: string;
    descripcion: string;
    duracion_estimada: number;
    precio_base: number;
};

type FormErrors = {
    nombre?:string;
    descripcion?:string;
    precio_base?:string;
    duracion_estimada?:string;
    [ key:string ]: string | undefined;
};

type Alerta = {
    tipo: string;
    mensaje: string;
};

function TipoServicioPage(){
    const [TipoServicio, setTipoServicio] = useState<TipoServicio[]>([]);
    const [nombre, setNombre] = useState<string>('');
    const [descripcion, setDescripcion] = useState<string>('');
    const [duracion_estimada, setDuracion_estimada] = useState<string>('');
    const [precio_base, setPrecio_base] = useState<string>('');
    const [error, setError] = useState<string>('')
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [TSseleccionado, setTsseleccionado] = useState<TipoServicio | null>(null);
    const [editar, setEditar] = useState<boolean>(false);
    const [alerta, setAlerta] = useState<Alerta>({ tipo: '', mensaje: '' });

    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchTipoServicio = async () => {
            try {
                const response = await axios.get(`${API_URL}/tiposervicio`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                const tipoServicios = response.data.data || [];
                setTipoServicio(tipoServicios);
            } catch (error:any) {
                setError(error.response?.data?.message || error.mensaje);
            } finally {
                setLoading(false);
            };
        };
        fetchTipoServicio();
    }, [accessToken]);

    useEffect(() => {
        if (TSseleccionado) {
            setNombre(TSseleccionado.nombre || '');
            setDescripcion(TSseleccionado.descripcion || '');
            setDuracion_estimada(String(TSseleccionado.duracion_estimada) || '');
            setPrecio_base(String(TSseleccionado.precio_base) || '');
        };
    }, [TSseleccionado]);

    const getTipoServicio = async () => {
        try {
            const response = await axios.get(`${API_URL}/tiposervicio`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            const tipoServicio = response.data.data || [];
            if (Array.isArray(tipoServicio)) {
                setTipoServicio(tipoServicio);
            }
        } catch (error:any) {
            console.error('Error al obtener los Tipos de Servicio:', error);
            setError(error.response?.data?.message || error.mensaje);
            setTipoServicio([]);
        };
    };

    const validateForm = () => {
        const errors: FormErrors = {};

        if (!nombre) {
            errors.nombre = "El nombre es obligatorio.";
        } else if (nombre.length > 255) {
            errors.nombre = "El nombre no puede tener más de 255 caracteres.";
        }

        if (!descripcion) {
            errors.descripcion = "La descripcion es obligatoria.";
        }

        if(!precio_base){
            errors.precio_base = "El precio base en obligatorio."
        }else if(Number(precio_base) < 0){
            errors.precio_base = "El precio base debe ser mayor a 0."
        };

        if(!duracion_estimada){
            errors.duracion_estimada = "La duracion estimada es obligatoria."
        } else if(Number(duracion_estimada) < 0){
            errors.duracion_estimada = "La duracion estimada en minutos no puede ser menor a 0."
        };

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        const payLoad = {
            nombre: nombre,
            descripcion: descripcion,
            duracion_estimada: Number(duracion_estimada),
            precio_base: Number(precio_base),
        };
        try {
            if (editar && TSseleccionado) {
                await axios.put(`${API_URL}/tiposervicio/${TSseleccionado.codigo_tipo}`, payLoad, {
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
                await axios.post(`${API_URL}/tiposervicio`, payLoad, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Tipo de Servicio registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            }
            await getTipoServicio();
            resetForm();
        } catch (error: any) {
            console.error('Error al guardar el tipo de servicio:', error);

            const errores = error.response?.data?.errores;
            const mensaje = error.response?.data?.message;

            if (Array.isArray(errores)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Errores de validación',
                    html: `<ul style="text-align:left;">${errores.map((err: string) => `<li>${err}</li>`).join('')}</ul>`,
                    confirmButtonText: 'Corregir',
                    position: 'center'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: mensaje || 'Hubo un problema al guardar el tipo de servicio.',
                    confirmButtonText: 'Aceptar',
                    position: 'center'
                });
            };
        };
    };

    const resetForm = () => {
        setNombre('');
        setDescripcion('');
        setDuracion_estimada('');
        setPrecio_base('');
        setTsseleccionado(null);
        setEditar(false);
        setErrors({});
    };

    const eliminarTipoServicio = async (codigo_tipo:string) => {
        try{
            const response = await axios.get(`${API_URL}/tiposervicio/obtenerMisServicios/${codigo_tipo}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            }
        }); 
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
                text: 'El tipo servicio tiene un turno asignado',
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
                await axios.delete(`${API_URL}/tiposervicio/${codigo_tipo}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                getTipoServicio();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El tipo de servicio ha sido eliminado con éxito.',
                    confirmButtonText: 'Aceptar'
                });
            };
        }catch(error:any){
            console.error('Error al eliminar el tipo de servico:', error);
            const errorMessage =error.response?.data?.message || 'Error al eliminar el tipo servicio';
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
                    <h3>Alta de Tipos de Servicios</h3>
                </div>
    
                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 100px)', overflow: 'hidden' }}>
                    <div className="form-container" style={{
                        padding: '20px',
                        boxSizing: 'border-box',
                        maxHeight: '40vh',
                        overflowY: 'auto'
                        }}>
                        <form onSubmit={handleSubmit}>
                            <div className="row mb-3">

                                <div className="col-md-6">
                                    <label className="form-label">Nombre del Tipo de Servicio:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setNombre(event.target.value)}
                                        className="form-control"
                                        value={nombre || ""}
                                        placeholder="Ingrese el nombre"
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
                                    <label className="form-label">Precio base:</label>
                                    <input
                                        type="text"
                                        onChange={(event) => setPrecio_base(event.target.value)}
                                        className="form-control"
                                        value={precio_base || ""}
                                        placeholder="Ingrese el precio base"
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
                                        placeholder="Duracion es minutos"
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
    
                    <div className="table-container" style={{
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: '60vh'
                    }}>
                        <table className="table table-hover">
                            <thead className="table-primary sticky-top">
                                <tr>
                                    <th scope="col">Código</th>
                                    <th scope="col">Nombre Tipo Servicio</th>
                                    <th scope="col">Descripcion</th>
                                    <th scope="col">Duracion Estimada</th>
                                    <th scope="col">Precio base</th>
                                    <th scope="col" className='text-center'>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {
                                    TipoServicio.map(val => (
                                        <tr key={val.codigo_tipo}>
                                            <th>{val.codigo_tipo}</th>
                                            <th>{val.nombre}</th>
                                            <td>{val.descripcion}</td>
                                            <td>{val.duracion_estimada}</td>
                                            <td>{val.precio_base}</td>
                                            <td>
                                                <div className="d-flex justify-content-center gap-2 mt-3">
                                                    <button className="btn btn-primary btn-sm" onClick={() => { setTsseleccionado(val); setEditar(true); }}>Editar</button>
                                                    <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarTipoServicio(String(val.codigo_tipo))}>Eliminar</button>
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

export default TipoServicioPage;