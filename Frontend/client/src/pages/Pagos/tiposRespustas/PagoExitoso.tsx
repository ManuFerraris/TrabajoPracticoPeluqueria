import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../auth/constants.ts';
import './PagoExitoso.css';

export default function PagoExitoso() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [estado, setEstado] = useState<'cargando' | 'pagado' | 'error'>('cargando');
    const navigate = useNavigate();

    useEffect(() => {
        const validarPago = async () => {
            if (!sessionId) {
                setEstado('error');
                return;
            };

            try {
                const response = await axios.get(`${API_URL}/pagos/stripe-session/${sessionId}`);
                const { payment_status } = response.data;

                if (payment_status === 'paid') {
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
                    <button onClick={volver}>Regresar a la App</button>
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