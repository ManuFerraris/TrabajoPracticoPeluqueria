import { Pago } from "../../../pago/pago.entity.js";
import { Turno } from "../../../turno/turno.entity.js";
import Stripe from 'stripe';

export async function crearInstanciaPago(turno:Turno):Promise<Pago>{
    const monto = turno.servicio.total;
    const medioPago = turno.servicio.medio_pago 

    const pago = new Pago();
    pago.monto = monto;
    if(turno.servicio.medio_pago === 'Efectivo'){
        pago.estado = 'Pagado';
    }else {
        pago.estado = 'Pendiente';
    };
    pago.metodo = medioPago;
    pago.fecha_hora = new Date();
    pago.recibo_enviado = true;
    pago.fecha_envio = new Date();
    pago.turno = turno;

    return pago;
};

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno");
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-07-30.basil" });

export async function crearSessionStripe(pago:Pago):Promise<Stripe.Checkout.Session>{
    const monto = pago.monto;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: { currency: 'usd', product_data: { name: ' Servicio de peluqueria ' }, unit_amount: monto * 100 },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `http://localhost:3001/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3001/pago-cancelado`,
        metadata: {
            pago_id: pago.id
        }
    });
    return session;
};