import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Swal from 'sweetalert2';
import { API_URL } from '../../auth/constants.ts';


interface Peluquero {
    codigo_peluquero: number;
    nombre: string;
    fecha_Ingreso: string;
    tipo: 'Domicilio' | 'Sucursal';
    rol: 'peluquero' | 'admin';
    email: string;
    password?: string;
};

interface FormErrors {
    [key: string]: string;
};

type TipoAlerta = 'error' | 'warning' | 'info' | 'success';
interface ErrorAlerta {
    tipo: TipoAlerta;
    mensaje: string;
}

function PeluqueroList() {
    const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
    const [nombre, setNombre] = useState<string>('');
    const [fecha_Ingreso, setFechaIngreso] = useState<string>('');
    const [tipo, setTipo] = useState<string>('');
    const [rol, setRol] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [/*errores*/, setErrores] = useState<ErrorAlerta[]>([]);
    const [editar, setEditar] = useState<boolean>(false);
    const [peluqueroSeleccionado, setPeluqueroSeleccionado] = useState<Peluquero | null>(null);
    const [alerta, setAlerta] = useState<ErrorAlerta | null>(null);
    const accessToken = localStorage.getItem('accessToken');

    useEffect(() => {
        const fetchPeluqueros = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/peluqueros`, {
                headers: { Authorization: `Bearer ${accessToken}` }
                });
                const peluqueros = Array.isArray(response.data?.data) ? response.data.data : [];
                setPeluqueros(peluqueros);
                setError(null);
            } catch (error: any) {
                if (error.response && error.response.data && Array.isArray(error.response.data.errores)) {
                    console.error(error.response.data.errores);
                } else {
                    console.error("Error inesperado:", error);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchPeluqueros();
    }, [accessToken]);

    const formatFechaPlano = (fecha: string): string => {
    // Asume que fecha ya está en formato YYYY-MM-DD
        const [yyyy, mm, dd] = fecha.split('-');
        return `${dd}/${mm}/${yyyy}`;
    };

    useEffect(() => {
        if (peluqueroSeleccionado) {
        setNombre(peluqueroSeleccionado.nombre || '');
        setFechaIngreso(peluqueroSeleccionado.fecha_Ingreso ? formatFechaPlano(peluqueroSeleccionado.fecha_Ingreso) : '');
        setTipo(peluqueroSeleccionado.tipo || '');
        setEmail(peluqueroSeleccionado.email || '');
        setRol(peluqueroSeleccionado.rol || '');
        setPassword('');
        };
    }, [peluqueroSeleccionado]);

    const getPeluqueros = async () => {
        try {
            const response = await axios.get(`${API_URL}/peluqueros`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const peluqueros = Array.isArray(response.data?.data) ? response.data.data : [];
            setPeluqueros(peluqueros);
        } catch (error) {
            console.error('Error al obtener los peluqueros:', error);
        setPeluqueros([]);
        }
    };

    const validateForm = (): FormErrors => {
        const errors: FormErrors = {};
        const today = new Date().toISOString().split('T')[0];

        if (!nombre) {
            errors.nombre = "El nombre es obligatorio.";
        } else if (nombre.length > 255) {
            errors.nombre = "El nombre no puede tener más de 255 caracteres.";
        };

        if (!fecha_Ingreso) {
            errors.fecha_Ingreso = "La fecha de ingreso es obligatoria.";
        } else if (fecha_Ingreso > today) {
            errors.fecha_Ingreso = "La fecha de ingreso no puede ser mayor a la fecha actual.";
        };

        if (!tipo) {
            errors.tipo = "El tipo es obligatorio.";
        } else if (tipo !== "Domicilio" && tipo !== "Sucursal") {
            errors.tipo = "El tipo debe ser 'Domicilio' o 'Sucursal'.";
        };

        if (!rol) {
            errors.rol = "El rol es obligatorio.";
        } else if (rol !== "peluquero" && rol !== "admin") {
            errors.rol = "El rol debe ser 'peluquero' o 'admin'.";
        };

        if (!email) {
            errors.email = "El email es obligatorio.";
        };

        if (!password && !editar) {
            errors.password = "La contraseña es obligatoria.";
        };

        return errors;
    };

    const resetForm = () => {
        setNombre('');
        setFechaIngreso('');
        setTipo('');
        setRol('');
        setEmail('');
        setPassword('');
        setErrors({});
        setEditar(false);
        setPeluqueroSeleccionado(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const validationErrors = validateForm();
        const erroresFormateados: ErrorAlerta[] = Object.entries(validationErrors).map(([campo, mensaje]) => ({
            tipo: 'error',
            mensaje: `${campo}: ${mensaje}`
        }));
        setErrores(erroresFormateados);

        try {
            const fechaFormateada = fecha_Ingreso;

            if (editar && peluqueroSeleccionado) {
            const dataToSend: Partial<Peluquero> = {
                nombre,
                fecha_Ingreso: fechaFormateada,
                tipo: tipo as 'Domicilio' | 'Sucursal',
                rol: rol as 'peluquero' | 'admin',
                email
            };

            if (password) {
                dataToSend.password = password;
            };
            /*console.log("Payload enviado:", {
                    nombre,
                    fecha_Ingreso,
                    tipo,
                    rol,
                    email,
                    password,
                });*/

            await axios.put(`${API_URL}/peluqueros/${peluqueroSeleccionado.codigo_peluquero}`, dataToSend, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Actualización exitosa',
                showConfirmButton: false,
                timer: 1500
            });
            } else {
                /*console.log("Payload enviado:", {
                    nombre,
                    fecha_Ingreso,
                    tipo,
                    rol,
                    email,
                    password,
                });*/
                const nuevoPeluquero: Peluquero = {
                    codigo_peluquero: 0, // se ignora en backend
                    nombre,
                    fecha_Ingreso: fechaFormateada,
                    tipo: tipo as 'Domicilio' | 'Sucursal',
                    rol: rol as 'peluquero' | 'admin',
                    email,
                    password
                };

                await axios.post(`${API_URL}/peluqueros`, nuevoPeluquero, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Peluquero registrado',
                    showConfirmButton: false,
                    timer: 1500
                });
            };

            getPeluqueros();
            resetForm();
        } catch (error: any) {
            console.error('Error al guardar el peluquero:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Hubo un problema al guardar el peluquero.',
                confirmButtonText: 'Aceptar',
                position: 'center'
            });
        };
    };

    const eliminarPeluquero = async (codigo_peluquero: number) => {
        try {
            //console.log("Codigo de peluquero enviado: ", codigo_peluquero);
            const response = await axios.get(`${API_URL}/peluqueros/misTurnos/${codigo_peluquero}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
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
                    text: 'El peluquero tiene turnos asignados',
                    confirmButtonText: 'Aceptar'
                });
                return;
            }

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
                await axios.delete(`${API_URL}/peluqueros/${codigo_peluquero}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });

                getPeluqueros();

                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: 'El peluquero ha sido eliminado con éxito.',
                    confirmButtonText: 'Aceptar'
                });

                //console.log('Peluquero eliminado con éxito.');
            };
        } catch (error: any) {
            console.error('Error al eliminar el peluquero:', error);

            const errorMessage =
            error.response?.data?.message || 'Error al eliminar el peluquero';

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonText: 'Aceptar'
            });
        }
    };

    // Renderizado condicional
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container-fluid d-flex flex-column justify-content-center align-items-center vh-100">
            <div className="card shadow-lg w-100" style={{ maxWidth: '1200px' }}>
                <div className="card-header text-center bg-primary text-white py-2">
                    <h3>Gestión de Peluqueros</h3>
                </div>

                <div className="card-body d-flex flex-column" style={{ maxHeight: 'calc(100vh - 50px)', overflow: 'hidden' }}>
                    {/* Formulario */}
                    <div className="form-container" style={{ padding: '20px', boxSizing: 'border-box' }}>
                        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => handleSubmit(e)}>
                            <div className="row g-3">
                                {/* Nombre */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Nombre y Apellido:</label>
                                    <input
                                    type="text"
                                    className="form-control"
                                    value={nombre}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
                                    placeholder="Nombre completo"
                                    />
                                    {errors.nombre && <div className="text-danger small mt-1">{errors.nombre}</div>}
                                </div>

                                {/* Fecha de ingreso */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Fecha de Ingreso:</label>
                                    <input
                                    type="date"
                                    className="form-control"
                                    value={fecha_Ingreso}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFechaIngreso(e.target.value)}
                                    />
                                    {errors.fecha_Ingreso && <div className="text-danger small mt-1">{errors.fecha_Ingreso}</div>}
                                </div>

                                {/* Tipo */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Tipo:</label>
                                    <select
                                    className="form-select"
                                    value={tipo}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTipo(e.target.value)}
                                    >
                                    <option value="">Seleccione tipo</option>
                                    <option value="Domicilio">Domicilio</option>
                                    <option value="Sucursal">Sucursal</option>
                                    </select>
                                    {errors.tipo && <div className="text-danger small mt-1">{errors.tipo}</div>}
                                </div>

                                {/* Rol */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Rol:</label>
                                    <select
                                    className="form-select"
                                    value={rol}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRol(e.target.value)}
                                    >
                                    <option value="">Seleccione rol</option>
                                    <option value="peluquero">Peluquero</option>
                                    <option value="admin">Administrador</option>
                                    </select>
                                    {errors.rol && <div className="text-danger small mt-1">{errors.rol}</div>}
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Email:</label>
                                    <input
                                    type="email"
                                    className="form-control"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                    />
                                    {errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                                </div>

                                {/* Contraseña */}
                                <div className="col-md-6">
                                    <label className="form-label fw-bold">Contraseña:</label>
                                    <input
                                    type="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required={!editar}
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
                                            onClick={() => {
                                                setEditar(false);
                                                resetForm();
                                            }}
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
                        </form>
                    </div>

                    {/* Tabla de peluqueros */}
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
                                {peluqueros.map((val: Peluquero) => (
                                    <tr key={val.codigo_peluquero}>
                                    <td className="fw-semibold">{val.codigo_peluquero}</td>
                                    <td>{val.nombre}</td>
                                    <td>{formatFechaPlano(val.fecha_Ingreso)}</td>
                                    <td>
                                        <span className={`badge ${val.tipo === 'Domicilio' ? 'bg-info' : 'bg-primary'}`}>
                                        {val.tipo}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                            setPeluqueroSeleccionado(val);
                                            setEditar(true);
                                            }}
                                        >
                                            <i className="bi bi-pencil"></i> Editar
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

                {/* Alerta flotante */}
                {alerta && (
                    <div
                        className={`alert alert-${alerta.tipo} alert-dismissible fade show`}
                        role="alert"
                        style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: 'auto',
                        minWidth: '300px',
                        zIndex: 1050
                        }}
                    >
                        <div className="d-flex align-items-center">
                        <i
                            className={`bi ${
                            alerta.tipo === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
                            } me-2`}
                        ></i>
                        <div>{alerta.mensaje}</div>
                        <button
                            type="button"
                            className="btn-close ms-auto"
                            onClick={() => setAlerta(null)}
                        ></button>
                        </div>
                    </div>
                    )}
            <div/>
        </div>
    </div>
    )
};

export default PeluqueroList;