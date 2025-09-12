import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../../auth/constants.ts";
import { useAuth } from "../../auth/AuthProvider.tsx";
import { useCallback } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { getNombrePeluquero } from "../AltaTurno/utils/formUtils.ts";
import { usePagoStripe } from "./hooks/usePagoStripe.tsx";

type Turno = {
    codigo_turno:number;
    fecha_hora:string;
    tipo_turno: 'Sucursal' | 'A Domicilio';
    porcentaje:number;
    estado: "Activo" | "Cancelado" | "Sancionado" | "Atendido";
    peluquero: number;
    servicio: {
        monto:number;
        adicional_adom:number;
        ausencia_cliente: "Se presento" | "Esta ausente" | "Esperando atencion";
        medio_pago: 'Efectivo' | 'Stripe';
        total:number;
        tipoServicio: {
            codigo_tipo:number;
            nombre:string;
            descripcion:string;
            duracion_estimada:number;
            precio_base:number;
        };
    };
};

type Peluquero = {
    codigo_peluquero:number;
    nombre:string;
};

const PagosPage = () => {

    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [codigo_turno, setCodigo_turno] = useState<number | null>();
    const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);

    const { user } = useAuth();
    const codCliente = user?.codigo;
    const nomCli = user?.nombre;
    const accessToken = localStorage.getItem('accessToken');
    const { pagarTurno: pagarConStripe } = usePagoStripe();

    const fetchTurnosAPagar = useCallback(async (codCliente:number) => {
        try{
            const response = await axios.get(`${API_URL}/clientes/misTurnosAPagar/${codCliente}`, {
                headers: { 'Authorization':  accessToken }
            });
            console.log("Respuesta completa recibida del backend: ", response);
            const turnos = response.data.data || [];
            console.log("Turnos sin pagos: ", turnos);
            if(turnos.length > 0){
                setTurnos(turnos);
            };
        }catch(error: any){
            console.log("Ha ocurrido un error inerperado", error);
            if (error.response && error.response.data && Array.isArray(error.response.data.errores)) {
                console.error(error.response.data.errores);
            } else {
                console.error("Error inesperado:", error);
            };
        };
    }, [accessToken]);

    const fetchPeluqueros = useCallback(async () => {
        try{
            const response = await axios.get(`${API_URL}/peluqueros`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const peluqueros = response.data.data || [];
            if(peluqueros.length > 0){
                setPeluqueros(peluqueros);
            };
        }catch(error:any){
            console.log("Ha ocurrido un error inerperado", error);
            if (error.response && error.response.data && Array.isArray(error.response.data.errores)) {
                console.error(error.response.data.errores);
            } else {
                console.error("Error inesperado:", error);
            };
        };
    },[accessToken]);

    useEffect(()=> {
        if(!codCliente){
            console.log("El codigo del cliente logueado es undefined");
            return;
        };
        fetchTurnosAPagar(codCliente)
        fetchPeluqueros()
    }, [fetchTurnosAPagar, fetchPeluqueros, codCliente]);

    const turnoSeleccionado = turnos.find((t) => t.codigo_turno === codigo_turno);

    const confirmarAccion = async (titulo: string): Promise<boolean> => {
        const resultado = await Swal.fire({
            title: titulo,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Sí, confirmar",
            cancelButtonText: "No",
            reverseButtons: true
        });
        return resultado.isConfirmed;
    };

    const pagarTurno = async (codTurno:number, metodo:string, accessToken:string | null) => {
        console.log("Datos para realizar el pego:, codTurno, metodo, token: ", codTurno, metodo, accessToken);
        if(!accessToken){
            Swal.fire("Error", "No se encontró el token de acceso", "error");
            return;
        };
        try{
            await pagarConStripe(codTurno, metodo, accessToken);
        }catch(error:any){
            const mensajeBackend =  error.response?.data?.message ?? "Error inesperado al pagar el turno.";
            console.error("Error al pagar:", mensajeBackend);
            Swal.fire({
                icon: "error",
                title: "Error al pager el turno",
                text: mensajeBackend,
                confirmButtonText: "Aceptar"
            });
        };
    };

    return (
        <div className="container mt-4">
            <div className="text-center mb-4">
                <h1 className="text-info fw-bold">Pago de turno</h1>
                <h5 className="text-muted">
                    Aqui podra pagar los turnos que tenga reservados.
                </h5>
            </div>
            <div className="d-flex justify-content-center">
                <div className="mb-4">
                    <label htmlFor="turnoSelect" className="form-label fw-semibold">
                        Selecciona el turno a pagar:
                    </label>
                    <select
                        id="turnoSelect"
                        className="form-select"
                        value={codigo_turno ?? ""}
                        onChange={(e)=> {
                            const value = e.target.value;
                            setCodigo_turno(value ? Number(value) : null);
                            
                        }}
                    >
                        <option value="">Seleccionar un turno...</option>
                        {turnos.map((turno) => (
                            <option key={turno.codigo_turno} value={turno.codigo_turno}>
                                {new Date(turno.fecha_hora).toLocaleString()} - Estado: {turno.estado} - Peluquero: {getNombrePeluquero(peluqueros, turno.peluquero)}
                            </option>
                            
                        ))}
                        
                    </select>
                    {/*Resumen del turno a pagar*/}
                    {turnoSeleccionado && (
                        <div className="card mt-4 shadow-sm">
                            <div className="card-header bg-info text-white fw-bold text-center">
                            Resumen del Turno a Pagar
                            </div>
                            <div className="card-body">
                            <table className="table table-bordered table-sm">
                                <tbody>
                                <tr>
                                    <th>Código de Turno</th>
                                    <td>{turnoSeleccionado.codigo_turno}</td>
                                </tr>
                                <tr>
                                    <th>Fecha y Hora</th>
                                    <td>{new Date(turnoSeleccionado.fecha_hora).toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <th>Cliente</th>
                                    <td>{nomCli}</td>
                                </tr>
                                <tr>
                                    <th>Peluquero</th>
                                    <td>{getNombrePeluquero(peluqueros, turnoSeleccionado.peluquero)}</td>
                                </tr>
                                <tr className="table-secondary">
                                    <th colSpan={2} className="text-center">Tipo de Servicio</th>
                                </tr>
                                <tr>
                                    <th>Nombre</th>
                                    <td>{turnoSeleccionado.servicio?.tipoServicio.nombre}</td>
                                </tr>
                                <tr>
                                    <th>Descripción</th>
                                    <td>{turnoSeleccionado.servicio?.tipoServicio.descripcion}</td>
                                </tr>
                                <tr>
                                    <th>Precio Base</th>
                                    <td>${turnoSeleccionado.servicio?.tipoServicio.precio_base}</td>
                                </tr>
                                <tr className="table-secondary">
                                    <th colSpan={2} className="text-center">Detalle de Pago</th>
                                </tr>
                                <tr>
                                    <th>Monto</th>
                                    <td>${turnoSeleccionado.servicio.monto}</td>
                                </tr>
                                <tr>
                                    <th>Adicional a Domicilio</th>
                                    <td>${turnoSeleccionado.servicio.adicional_adom}</td>
                                </tr>
                                <tr>
                                    <th>Medio de Pago</th>
                                    <td>{turnoSeleccionado.servicio.medio_pago}</td>
                                </tr>
                                <tr className="table-success fw-bold">
                                    <th>Total</th>
                                    <td>${turnoSeleccionado.servicio.total}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    )}
                    <div className="text-center mt-3">
                        <button
                            className="btn btn-primary fw-semibold"
                            style={{
                                padding: "8px 16px",
                                borderRadius: "6px",
                                fontSize: "15px",
                                whiteSpace: "nowrap"
                            }}
                            onClick={ async () => {
                                if (!codigo_turno) {
                                    Swal.fire("Error", "Seleccioná un turno válido para pagar", "error");
                                    return;
                                };
                                const confirmado = await confirmarAccion(
                                    "¿Confirmas el pago?"
                                );
                                if (confirmado) {
                                    pagarTurno(codigo_turno, "Stripe", accessToken);
                                    setCodigo_turno(null);
                                };
                            }}
                            title="Seleccioná un turno primero"
                            disabled={!codigo_turno}
                        >
                            Pagar Turno
                        </button>
                    </div>
                    
                </div>
            </div>
        </div>
    )
};

export default PagosPage;