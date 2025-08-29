import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../../auth/constants.ts';

export default function PagoExitoso() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    console.log("SessionId recibido:", sessionId);
    const [estado, setEstado] = useState<'cargando' | 'pagado' | 'error'>('cargando');

    useEffect(() => {
        const validarPago = async () => {
            if (!sessionId) {
                setEstado('error');
                return;
            };

            try {
                console.log("sessionId recibido:", sessionId);
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

    if (estado === 'cargando') return <p>Validando tu pago...</p>;
    if (estado === 'pagado') return <h2>¡Gracias por tu pago!</h2>;
    return <p>No pudimos validar tu pago. Contactanos si ya pagaste.</p>;
};