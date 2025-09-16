import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../auth/constants.ts";
import { useAuth } from "../auth/AuthProvider.tsx";
import { useCallback } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { usePagoStripeEfectivo } from "../pages/Pagos/hooks/usePagoStripe.tsx";

type Turno = {
    codigo_turno:number;
    fecha_hora:string;
    tipo_turno: 'Sucursal' | 'A Domicilio';
    porcentaje:number;
    estado: "Activo" | "Cancelado" | "Sancionado" | "Atendido";
    peluquero: {
        codigo_peluquero:number;
        nombre:string;
    };
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

/*type Peluquero = {
    codigo_peluquero:number;
    nombre:string;
};*/

export default function PagoEfectivo(){

    const [turno, setTurno] = useState<Turno>({} as Turno);
    const [codigo_turno, setCodigo_turno] = useState<number | null>();
    //const [peluqueros, setPeluqueros] = useState<Peluquero[]>([]);
    
    const { user } = useAuth();
    const codPel = user?.codigo;
    const accessToken = localStorage.getItem('accessToken');
    const { pagarTurno: pagarConStripe } = usePagoStripeEfectivo();

    // Aca se traen los turnos del cliente en en estado "Activo" y que no tengan pago asociado.
    const fetchTurnoAPagar = useCallback(async (codigo_turno:number) => {
        try{
            const response = await axios.get(`${API_URL}/turnos/${codigo_turno}`, {
                headers: { 'Authorization':  accessToken }
            });
            //console.log("Respuesta completa recibida del backend: ", response);
            const turno = response.data || [];
            //console.log("Turnos sin pagos: ", turno);
            if(turno){
                setTurno(turno);
                setCodigo_turno(turno.codigo_turno);
            };
        }catch(error: any){
            //console.log("Ha ocurrido un error inerperado", error);
            if (error.response && error.response.data && Array.isArray(error.response.data.errores)) {
                console.error(error.response.data.errores);
            } else {
                console.error("Error inesperado:", error);
            };
        };
    }, [accessToken]);

    /*const fetchPeluqueros = useCallback(async () => {
        try{
            const response = await axios.get(`${API_URL}/peluqueros`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            const peluqueros = response.data.data || [];
            //console.log("Peluqueros obtenidos: ", peluqueros);
            if(peluqueros.length > 0){
                setPeluqueros(peluqueros);
            };
        }catch(error:any){
            //console.log("Ha ocurrido un error inerperado", error);
            if (error.response && error.response.data && Array.isArray(error.response.data.errores)) {
                console.error(error.response.data.errores);
            } else {
                console.error("Error inesperado:", error);
            };
        };
    },[accessToken]);*/

    useEffect(()=> {
        if(!codPel){
            console.log("El codigo del cliente logueado es undefined");
            return;
        };
        if(!codigo_turno){
            console.log("El codigo del turno a pagar es undefined");
            return;
        };
        fetchTurnoAPagar(codigo_turno);
        /*fetchPeluqueros();*/
    }, [fetchTurnoAPagar, /*fetchPeluqueros,*/ codPel, codigo_turno]);

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
        //console.log("Datos para realizar el pego:, codTurno, metodo, token: ", codTurno, metodo, accessToken);
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
            <h2 className="mb-4">Pago en Efectivo</h2>
            <div className="mb-3">
                <label htmlFor="codigo_turno" className="form-label">Código de Turno a Pagar:</label>
                <input
                    type="number"
                    className="form-control"
                    id="codigo_turno"
                    value={codigo_turno || ''}
                    onChange={(e) => setCodigo_turno(Number(e.target.value))}
                />
            </div>
            {turno && turno.servicio ? (
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">Detalle del Turno</h5>
                        <p className="card-text"><strong>Código del Turno:</strong> {turno.codigo_turno}</p>
                        <p className="card-text"><strong>Fecha y Hora:</strong> {new Date(turno.fecha_hora).toLocaleString()}</p>
                        <p className="card-text"><strong>Tipo de Turno:</strong> {turno.tipo_turno}</p>
                        <p className="card-text"><strong>Estado:</strong> {turno.estado}</p>
                        <p className="card-text"><strong>Peluquero:</strong> {turno.peluquero.nombre}</p>
                        <p className="card-text"><strong>Tipo de Servicio:</strong> {turno.servicio.tipoServicio.nombre}</p>
                        <p className="card-text"><strong>Monto del Servicio:</strong> ${turno.servicio.monto.toFixed(2)}</p>
                        <p className="card-text"><strong>Total a Pagar:</strong> ${turno.servicio.total.toFixed(2)}</p>
                        <p className="card-text"><strong>Medio de pago:</strong> ${turno.servicio.medio_pago}</p>
                    </div>
                </div>
            ) : (
                <p>No hay turno seleccionado o el turno no tiene un pago asociado.</p>
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
                            //console.log("Iniciando pago para el turno:", codigo_turno);
                            pagarTurno(codigo_turno, "Efectivo", accessToken);
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
    );
};