import { loadStripe } from '@stripe/stripe-js';
import { API_URL } from '../../../auth/constants.ts';
import axios from 'axios';
import Swal from 'sweetalert2';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

export function usePagoStripeEfectivo () {
    const pagarTurno = async (codTurno:number, metodo: string, accessToken:string) => {
        try{
            console.log("Iniciando pago para el turno:", codTurno, "con método:", metodo);
            const response = await axios.post(`${API_URL}/pagos/realizarPago/${codTurno}/${metodo}`,
                {}, 
                {
                    headers: { Authorization: `Bearer ${accessToken}` }
                }
            );
            console.log("Respuesta backend:", response.data);
            const { tipo, pago, sessionId, errores } = response.data;

            if(tipo === "Stripe"){
                const stripe = await stripePromise;
                stripe?.redirectToCheckout({ sessionId });
            };
            if (tipo === "Pago" && pago.estado === "Pagado") {
                Swal.fire({
                    icon: "success",
                    title: "Pago registrado",
                    text: "El pago en efectivo fue registrado correctamente.",
                    confirmButtonText: "Aceptar"
                });
            };
            if(tipo === "Error"){
                Swal.fire({
                    icon: "error",
                    title: "Error al registrar el pago",
                    text: "No se pudo registrar el pago en efectivo. Intente nuevamente.",
                    confirmButtonText: "Aceptar"
                });
                console.error("Errores del backend:", errores);
            };
            return;
        }catch(error:any){
            const mensajeBackend = error.response?.data?.message ?? "Error inesperado al pagar el turno.";
            console.error("Error al pagar:", mensajeBackend);
            Swal.fire({
                icon: "error",
                title: "Error al pagar el turno",
                text: mensajeBackend,
                confirmButtonText: "Aceptar"
            });
        };
    };
    return { pagarTurno };
};