import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../auth/constants.ts";
import { useAuth } from "../auth/AuthProvider.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';

interface Peluquero {
    codigo_peluquero: number;
    nombre: string;
};

interface TipoServicio {
    codigo_tipo:number;
    nombre:string;
    precio_base:number;
};

interface Payload {
    turno: {
        tipo_turno: "Sucursal" | "A Domicilio";
        codigo_cliente: number | undefined;
        codigo_peluquero: number | null;
        fecha_hora: string;
    };
    servicio: {
        medio_pago: "Mercado Pago" | "Efectivo";
        tipo_servicio_codigo: number;
    };
};

// Con Partial errors solo tiene los campos que fallan.
type FormErrors = Partial<{
    fecha_hora: string;
    medio_pago: string;
    tipo_turno: string;
    codigo_cliente: string;
    codigo_peluquero: string;
    tipo_servicio_codigo: string;
}>;

function AltaTurnoPage(){
    const { user } = useAuth();
    const accessToken = localStorage.getItem('accessToken');

    // Datos cargados desde el backend
    const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
    const [tiposServicios, setTiposServicios] = useState<TipoServicio[]>([]);
    const [horariosDisponibles, setHorariosDisponibles] = useState([]);

    //turno
    const [tipo_turno, setTipoTurno] = useState<"Sucursal" | "A Domicilio">("Sucursal");
    const [codigo_peluquero, setCodigoPeluquero] = useState<number | null>(null);
    const [horarioSeleccionado, setHorarioSeleccionado] = useState<string | null>(null); // el que se selecciona del slot.
    const [fecha_hora, setFechaHora] = useState<string>(""); // dia para generar el slot.
    const codigo_cliente = user?.codigo;

    // servicio
    const [medio_pago, setMedioPago] = useState<"Mercado Pago" | "Efectivo">("Efectivo");
    const [tipo_servicio_codigo, setTipo_servicio_codigo] = useState<number | null>(null);

    //Generales
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState<boolean>(false);
    const [payloadConfirmacion, setPayloadConfirmacion] = useState<Payload | null>(null)
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (!user?.codigo) {
            return;
        }
    });

    //Obtenemos los peluqueros y los tipos de servicios
    useEffect(() => {
        const fetchPeluqueros = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/peluqueros`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const peluqueros = Array.isArray(response.data?.data) ? response.data.data.map((p: any) => ({
                    ...p,
                    codigo: Number(p.codigo) || 0,
                })) : [];
                console.log("Peluqueros traidos desde el backend: ", peluqueros)
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

        const fetchTipoServicio = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/tiposervicio`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                const tiposServicios = Array.isArray(response.data?.data)
                    ? response.data.data.map((s: any) => ({
                        ...s,
                        codigo: Number(s.codigo) || 0,
                })) : [];
                console.log("Tipos de servicios encontrados: ", tiposServicios);
                setTiposServicios(tiposServicios);
            } catch (error:any) {
                setError(error.response?.data?.message || error.mensaje);
            } finally {
                setLoading(false);
            };
        };
        fetchTipoServicio();
    }, [accessToken]);

    // Buscamos los horarios segun la disponibilidad del peluquero
    const fetchHorarios = async (codigoPeluquero:number, tipo_servicio_codigo:number,fechaHora:string, accessToken:string) => {
        try{
            const response = await axios.get(`${API_URL}/peluqueros/horariosDisponibles/${codigoPeluquero}/${tipo_servicio_codigo}`, {
                params: { fechaHora },
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            });
            const horariosDisponibles = response.data.data || [];
            setHorariosDisponibles(horariosDisponibles);
        }catch(error:unknown){
            if(axios.isAxiosError(error)){
                setError(error.response?.data?.message || error);
            } else {
                setError("Error inesperado");
            };
        }finally{
            setLoading(false);
        };
    };

    // Effect que ejecuta la garga de horarios
    useEffect( () => {
        if(codigo_peluquero && tipo_servicio_codigo && fecha_hora && accessToken){
            setLoading(true);
            fetchHorarios(codigo_peluquero, tipo_servicio_codigo, fecha_hora, accessToken)
        };
    }, [accessToken, tipo_servicio_codigo, codigo_peluquero, fecha_hora]);

    const validateForm = () => {
        const errors:FormErrors = {};

        const today = new Date().toISOString().split('T')[0];

        if (!tipo_turno) {
            errors.tipo_turno = "El tipo es obligatorio.";
        } else if(tipo_turno !== "Sucursal" && tipo_turno !== "A Domicilio"){
            errors.tipo_turno = "Seleccione un tipo de turno.";
        };

        if (!medio_pago) {
            errors.codigo_peluquero = "El medio de pago es obligatorio.";
        }else if(medio_pago !== "Mercado Pago" && medio_pago !== "Efectivo"){
            errors.tipo_turno = "Seleccione un tipo de turno.";
        };

        if (!fecha_hora) {
            errors.fecha_hora = "La fecha es obligatoria.";
        } else if(fecha_hora < today){
            errors.fecha_hora = "La fecha no puede ser menor a la de hoy";
        };

        if (!codigo_peluquero) {
            errors.codigo_peluquero = "El codigo de peluquero es obligatorio.";
        };

        if(!tipo_servicio_codigo){
            errors.tipo_servicio_codigo = "El tipo de servicio es obligatorio.";
        }

        return errors;
    };

    const getNombrePeluquero = (codigo:number | null) => 
        peluqueros.find(pel => pel.codigo_peluquero === codigo)?.nombre ?? "-";

    const getNombreTipoServicio = (codigo:number | null) =>
        tiposServicios.find(ts => ts.codigo_tipo === codigo)?.nombre ?? "-";

    const getPrecioBase = (codigo: number | null) =>
        tiposServicios.find(ts => ts.codigo_tipo === codigo)?.precio_base ?? 0;

    const handleSubmit = async (e: React.FormEvent )=>{
        e.preventDefault();
        console.log("Submit ejecutado")
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            Swal.fire("Error", "Hubo un error de validacion.");
            return;
        };
        if (!horarioSeleccionado) {
            Swal.fire("Error", "Debés seleccionar un horario disponible", "error");
            return;
        };
        if (!fecha_hora || isNaN(Date.parse(fecha_hora))) {
            Swal.fire("Error", "La fecha seleccionada no es válida", "error");
            return;
        };
        console.log("Por armar los DTOS...");
        const fechaHoraCompleta = `${fecha_hora}T${horarioSeleccionado}:00`;
        const turnoDTO = {
            tipo_turno,
            codigo_cliente,
            codigo_peluquero,
            fecha_hora: fechaHoraCompleta,
        };

        const servicioDTO = {
            medio_pago: medio_pago,
            tipo_servicio_codigo: Number(tipo_servicio_codigo),
        };
        const payload = {
            turno: turnoDTO,
            servicio: servicioDTO
        };
        console.log("Payload:", payload);
        console.log("Mostrar confirmación:", true);
        setPayloadConfirmacion(payload); // se guarda en estado.
        setMostrarConfirmacion(true);    // se muestra el modal.
    };

    const confirmarTurno = async () => {
        if (!accessToken) {
            Swal.fire("Error", "No estás autenticado. Por favor iniciá sesión.", "error");
            return;
        };
        if (!payloadConfirmacion) {
            console.log("No hay paylodad de confirmacion", payloadConfirmacion);
            return;
        };

        try{
            const response = await axios.post(`${API_URL}/turnos/altaTurno`, payloadConfirmacion, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
                console.log("Respuesta: ", response.data.data);
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Turno reservado!',
                    showConfirmButton: false,
                    timer: 1500
                });
        }catch(error:any){
            console.error("Error al guardar el turno:", error);
            const mensaje = error.response?.data?.message ?? "Error inesperado";
            const detalles = error.response?.data?.data;

            if (Array.isArray(detalles) && detalles.length > 0) {
                Swal.fire({
                icon: "error",
                title: "Error al reservar turno",
                html: `
                    <p>${mensaje}</p>
                    <ul style="text-align:left;">
                    ${detalles.map((d: string) => `<li>${d}</li>`).join("")}
                    </ul>
                `,
                confirmButtonText: "Aceptar",
                position: "center"
                });
            } else {
                Swal.fire({
                icon: "error",
                title: "Error",
                text: mensaje,
                confirmButtonText: "Aceptar",
                position: "center"
                });
            };
        };
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mt-4">
            <h4>Buscar horarios disponibles</h4>
    
            {/* Selector de peluquero */}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Peluquero</label>
                    <select
                        className="form-select"
                        value={codigo_peluquero ?? ""}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setCodigoPeluquero(value || null);
                        }}
                        >
                        <option value="">Seleccionar...</option>
                        {peluqueros.map((p) => (
                            <option key={p.codigo_peluquero} value={p.codigo_peluquero}>
                                {p.nombre}
                            </option>
                        ))}
                    </select>
                </div>
        
                {/* Selector de fecha */}
                <div className="mb-3">
                <label className="form-label">Fecha</label>
                <input
                    type="date"
                    className="form-control"
                    value={fecha_hora ?? ""}
                    onChange={(e) => {
                    setFechaHora(e.target.value); // ISO format
                    }}
                />
                </div>
        
                {/* Selector de tipo de servicio */}
                <div className="mb-3">
                <label className="form-label">Tipo de servicio</label>
                    <select
                        className="form-select"
                        value={tipo_servicio_codigo ?? ""}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setTipo_servicio_codigo(value || null);
                        }}
                        >
                        <option value="">Seleccionar...</option>
                        {tiposServicios.map((s) => (
                            <option key={s.codigo_tipo} value={s.codigo_tipo}>
                            {s.nombre}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-md-6">
                    <label className="form-label">Tipo de Turno:</label>
                    <select
                        className="form-select"
                            onChange={(event) => setTipoTurno(event.target.value as "Sucursal" | "A Domicilio")}
                            value={tipo_turno || ""}
                    >
                        <option value="">Seleccione una opcion</option>
                        <option value="Sucursal">Sucursal</option>
                        <option value="A Domicilio">A Domicilio</option>
                    </select>
                    {errors.tipo_turno && <div className="text-danger">{errors.tipo_turno}</div>}
                </div>

                <div className="col-md-6">
                    <label className="form-label">Medio de Pago:</label>
                    <select
                        className="form-select"
                        onChange={(event) => setMedioPago(event.target.value as "Efectivo" | "Mercado Pago")}
                        value={medio_pago || ""}
                    >
                        <option value="">Seleccione una opcion</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Mercado Pago">Mercado Pago</option>
                    </select>
                    {errors.medio_pago && <div className="text-danger">{errors.medio_pago}</div>}
                </div>
                
                {/* Tabla de horarios */}
                <h5>Horarios disponibles</h5>
                <table className="table table-bordered">
                    <thead>
                        <tr>
                        <th>Horario</th>
                        </tr>
                    </thead>
                    <tbody>
                        {horariosDisponibles.length > 0 ? (
                        horariosDisponibles.map((hora: string, index: number) => (
                            <tr key={index}>
                                <td>
                                    <button
                                        type="button"
                                        className={`btn btn-outline-primary ${horarioSeleccionado === hora ? "active" : ""}`}
                                        onClick={() => setHorarioSeleccionado(hora)}
                                    ></button>
                                    {hora}
                                </td>
                            </tr>
                        ))
                        ) : (
                        <tr>
                            <td>No hay horarios disponibles</td>
                        </tr>
                        )}
                    </tbody>
                </table>
                <button type="submit">Reservar turno</button>
            </form>

            {mostrarConfirmacion && payloadConfirmacion && (
                <div className="alert alert-info mt-4">
                    <h5>¿Confirmás tu turno?</h5>
                    <ul>
                        <li><strong>Peluquero:</strong> {getNombrePeluquero(payloadConfirmacion.turno.codigo_peluquero)}</li>
                        <li><strong>Fecha:</strong> {payloadConfirmacion.turno.fecha_hora}</li>
                        <li><strong>Horario:</strong> {horarioSeleccionado}</li>
                        <li><strong>Servicio:</strong> {getNombreTipoServicio(payloadConfirmacion.servicio.tipo_servicio_codigo)}</li>
                        <li><strong>Tipo de turno:</strong> {payloadConfirmacion.turno.tipo_turno}</li>
                        <li><strong>Medio de pago:</strong> {payloadConfirmacion.servicio.medio_pago}</li>
                        <li><strong>Monto:</strong> {getPrecioBase(payloadConfirmacion.servicio.tipo_servicio_codigo)}</li>
                    </ul>
                    {/* Botones */}
                    <button className="btn btn-primary me-2" onClick={confirmarTurno}>
                        Confirmar y reservar
                    </button>
                    <button className="btn btn-secondary" onClick={() => setMostrarConfirmacion(false)}>
                        Cancelar
                    </button>
                </div>
            )}
        </div>
    );
};

export default AltaTurnoPage;