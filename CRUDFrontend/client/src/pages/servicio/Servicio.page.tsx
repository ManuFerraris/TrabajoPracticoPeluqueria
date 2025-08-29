import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../auth/constants.ts';

type Servicio = {
    codigo: number;
    monto: number;
    estado: 'Pendiente' | 'Pago';
    adicional_adom?: string;
    ausencia_cliente: 'Se presento' | 'Esta ausente';
    medio_pago: 'Efectivo' | 'Stripe';
    turno_codigo_turno: string;
    tipo_servicio_codigo: string;
    total?: number;
    turno?: {
        codigo_turno:string;
    };
};

type TipoServicio = {
    codigo_tipo: string;
    nombre: string;
};

type FormErrors = {
    monto?: string;
    estado?: string;
    ausencia_cliente?: string;
    medio_pago?: string;
    turno_codigo_turno?: string;
    tipo_servicio_codigo?: string;
};

type Alerta = {
    tipo: string;
    mensaje: string;
};

function ServiciosPage(){
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [tipoServicio, setTipoServicio] = useState<TipoServicio[]>([]);

    const [monto, setMonto] = useState<string>('');
    const [estado, setEstado] = useState<'Pendiente' | 'Pago' | ''>('');
    const [/*adicional_adom*/, setAdicional_adom] = useState<string>('');
    const [ausencia_cliente, setAusencia_cliente] = useState<'Se presento' | 'Esta ausente' | 'Esperando atencion' | ''>('');
    const [medio_pago, setMedio_pago] = useState<'Efectivo' | 'Stripe' | ''>('');
    const [turno_codigo_turno, setTurno] = useState<string>('');
    const [tipo_servicio_codigo, setCodigo_tipo] = useState<string>('')
    const [/*total*/, setTotal] = useState<number>();

    const [error, setError] = useState<string>('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState<boolean>(false);
    const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio | false>(false);
    const [editar, setEditar] = useState<boolean>(false);
    const [alerta, setAlerta] = useState<Alerta>({ tipo: '', mensaje: ''} );
    const [servicioMostrado, setServicioMostrado] = useState<number | null>(null);

    const accessToken = localStorage.getItem('accessToken')

    useEffect(() => {
        const fetchServicios = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/servicios`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                const servicios = response.data.data || [];
                setServicios(servicios);
            } catch (error: any) {
                setError(error.response?.data?.message || error.message);
                console.error('Error al cargar los servicios:', error);
            } finally {
                setLoading(false);
            };
        };

        const fetchTipoServicio = async () => {
            try {
                const response = await axios.get(`${API_URL}/tipoServicio`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                const tipoServicio = response.data.data || [];
                setTipoServicio(tipoServicio);
            } catch ( error:any ) {
                setError(error.response?.data?.message || error.message);
                console.error("Error al cargar tipos de servicio:", error);
            };
        };
        fetchServicios();
        fetchTipoServicio();
    }, [accessToken]);

    useEffect(() => {
        if (servicioSeleccionado) {
            setMonto(String(servicioSeleccionado.monto) || '');
            setEstado(servicioSeleccionado.estado || '');
            setAdicional_adom(servicioSeleccionado.adicional_adom || '');
            setAusencia_cliente(servicioSeleccionado.ausencia_cliente || '');
            setMedio_pago(servicioSeleccionado.medio_pago || '');
            setTurno(servicioSeleccionado.turno?.codigo_turno || '');
            setTotal(servicioSeleccionado.total || 0);
            setCodigo_tipo(servicioSeleccionado.tipo_servicio_codigo || '');
            console.log("Servicio seleccionado:", servicioSeleccionado);
        }
    }, [servicioSeleccionado]);

    const getServicios = async () => {
        try {
            const response = await axios.get(`${API_URL}/servicios`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
            const servicios = response.data.data;
            if (Array.isArray(servicios)) {
                setServicios(servicios);
            };
        } catch (error:any) {
            setError(error.response?.data?.message || error.mensaje)
            console.error('Error al obtener los Servicios:', error);
            setServicios([]);
        };
    };

    const validateForm = () => {
        const errors: FormErrors = {};

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
        } else if(medio_pago !== "Efectivo" && medio_pago !== "Stripe"){
            errors.medio_pago = "Seleccione un medio de pago.";
        };

        if (!ausencia_cliente) {
            errors.ausencia_cliente = "Seleccione una opcion.";
        } else if(ausencia_cliente !== "Se presento" && ausencia_cliente !== "Esta ausente" && ausencia_cliente !== "Esperando atencion"){
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        };
        const payload = {
            monto: Number(monto),
            estado,
            ausencia_cliente,
            medio_pago,
            turno_codigo_turno,
            tipo_servicio_codigo,
        };
        try {
            if (editar && servicioSeleccionado) {
                await axios.put(`${API_URL}/servicios/${servicioSeleccionado.codigo}`, payload, {
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
                await axios.post(`${API_URL}/servicios`, payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
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
        };
    };

    const resetForm = () => {
        setMonto('');
        setEstado('');
        setAdicional_adom('');
        setAusencia_cliente('');
        setMedio_pago('');
        setTurno('');
        setCodigo_tipo('')
        setErrors({});
        setEditar(false);
        setServicioSeleccionado(false);
    };

    const eliminarServicio = async (codigo:string) => {
        try{
            const response = await axios.get(`${API_URL}/servicios/buscarMiTurno/${codigo}`, {
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
                text: 'El servicio tiene un turno asignado',
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
                await axios.delete(`${API_URL}/servicios/${codigo}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                getServicios();
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El servicio ha sido eliminado con éxito.',
                    confirmButtonText: 'Aceptar'
                });
            };
        }catch(error:any){
            console.error('Error al eliminar el servico:', error);
            const errorMessage =error.response?.data?.message || 'Error al eliminar el servicio';
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
                                        onChange={(event) => setEstado(event.target.value as "" | "Pendiente" | "Pago")}
                                        value={estado || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Pendiente">Pendiente</option>
                                        <option value="Pago">Pago</option>
                                    </select>
                                    {errors.estado && <div className="text-danger">{errors.estado}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label">Ausencia Cliente:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setAusencia_cliente(event.target.value as "" | "Se presento" | "Esta ausente")}
                                        value={ausencia_cliente || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Se presento">Se presento</option>
                                        <option value="Esta ausente">Esta ausente</option>
                                        <option value="Esperando atencion">Esperando atencion</option>
                                    </select>
                                    {errors.ausencia_cliente && <div className="text-danger">{errors.ausencia_cliente}</div>}
                                </div>
                                
                                <div className="col-md-6">
                                    <label className="form-label">Medio de Pago:</label>
                                    <select
                                        className="form-select"
                                        onChange={(event) => setMedio_pago(event.target.value as "" | "Efectivo" | "Stripe")}
                                        value={medio_pago || ""}
                                    >
                                        <option value="">Seleccione una opcion</option>
                                        <option value="Efectivo">Efectivo</option>
                                        <option value="Stripe">Stripe</option>
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
                                        onChange={(event) => setTurno(event.target.value)}
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
                                    <th scope="col">Estado</th>
                                    <th scope="col">Total</th>
                                    <th scope="col" className="text-end" style={{ paddingRight: '100px' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    servicios.map(val => (
                                        <tr key={val.codigo}>
                                            <td>{val.codigo}</td>
                                            <td>{val.estado}</td>
                                            <td>{val.total}</td>
                                            <td>
                                                <div className="d-flex justify-content-end gap-2">
                                                    {servicioMostrado === val.codigo ?(
                                                        <div>
                                                            <p>Monto: {val.monto}</p>
                                                            <p>Medio de Pago: {val.medio_pago}</p>
                                                            <p>Adicional a Domicilio: {val.adicional_adom}</p>
                                                            <p>Tipo de Servicio: {val.tipo_servicio_codigo}</p>
                                                            <p>Ausencia Cliente: {val.ausencia_cliente}</p>
                                                            <button className="btn btn-secondary" onClick={() => setServicioMostrado(null)}> Ocultar </button>
                                                        </div>
                                                
                                                ): (
                                                    <button className="btn btn-primary" onClick={() => setServicioMostrado(val.codigo)}> Mostrar Más </button>
                                                )}

                                                    <button className="btn btn-primary btn-sm" onClick={() => { setServicioSeleccionado(val); setEditar(true); }}>Editar</button>
                                                    <button className="btn btn-danger btn-sm ms-2" onClick={() => eliminarServicio(String(val.codigo))}>Eliminar</button>
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

export default ServiciosPage;