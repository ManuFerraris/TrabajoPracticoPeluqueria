import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../auth/constants.ts';
import './PagoExitoso.css';

interface Cliente {
    codigo_cliente: number;
    dni: string;
    NomyApe: string;
    direccion: string;
    estado: string;
};

interface Peluquero {
    codigo_peluquero: number;
    nombre: string;
    tipo: string;
};

interface TipoServicio {
    nombre: string;
    descripcion: string;
    duracion_estimada: number;
    precio_base: number;
};

interface Servicio {
    codigo: number;
    monto: number;
    estado: string;
    adicional_adom:number;
    ausencia_cliente: string;
    medio_pago: "Efectivo" | "Stripe";
    total: number;
    tipoServicio: TipoServicio; 
};

interface Turno {
    codigo_turno: number;
    fecha_hora: string;
    tipo_turno: string;
    porcentaje: number;
    estado: string;
    cliente: Cliente;
    peluquero: Peluquero;
    servicio: Servicio;
};

interface Pago {
    id: number;
    metodo: string;
    monto: number;
    estado: string;
    fecha_hora: string;
    turno: Turno;
}

export default function PagoExitoso() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [estado, setEstado] = useState<'cargando' | 'pagado' | 'error'>('cargando');
    const [pago, setPago] = useState<Pago | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        const validarPago = async () => {
            if (!sessionId) {
                setEstado('error');
                console.log(`Session ID no proporcionado: `, sessionId);
                return;
            };

            try {
                const response = await axios.get(`${API_URL}/pagos/stripe-session/${sessionId}`);
                const { payment_status, data } = response.data;
                console.log(`Respuesta de validación de pago: `, response.data);
                if (payment_status === 'paid') {
                    setPago(data);
                    setEstado('pagado');
                } else {
                    console.warn("Estado del pago no es 'paid':", payment_status);
                    setEstado('error');
                };
            }catch(error: any) {
                console.error("Error al validar el pago:", error.message);
                setEstado('error');
            };
        };
        validarPago();
    }, [sessionId]);

    const volver = () => navigate('/clientes/homeCliente');

    return (
        <div className="pago-exitoso-container">
            {estado === 'cargando' && <p className="estado">Validando tu pago...</p>}

            {estado === 'pagado' && (
            <div className="estado estado-exito">
                <h2>¡Gracias por tu pago!</h2>
                <p>Tu pago fue confirmado exitosamente.</p>

                {/* Botón para descargar el comprobante */}
                <div className="botones-container">
                    {pago && (
                        <a
                            href={`${API_URL}/pagos/reciboPDF/${pago.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="boton-descarga"
                        >
                            Descargar comprobante PDF
                        </a>
                    )}

                    <button onClick={volver}>Regresar a la App</button>
                </div>
            </div>
            )}

            {estado === 'error' && (
                <div className="estado estado-error">
                    <h2>No pudimos validar tu pago</h2>
                    <p>Si ya realizaste el pago, por favor contactanos.</p>
                    <button onClick={volver}>Volver al inicio</button>
                </div>
            )}
        </div>
    );
};