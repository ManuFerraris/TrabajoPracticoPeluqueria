import { Pago } from "../../../pago/pago.entity.js";
import { Turno } from "../../../turno/turno.entity.js";
import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from "path";

const isDev = process.env.NODE_ENV !== 'production';
dotenv.config({ path: path.resolve(process.cwd(), isDev ? '.env.local' : '.env'), override: true });
//console.log("Entorno detectado en PagoEfectivo-Stripe.ts:", isDev);
const FRONTEND_URL = process.env.FRONTEND_ORIGIN as string;

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
    const montoARS = pago.monto;
    const tiPoCambioUSD = 1400; // Ejemplo: 1 USD = 1400 ARS

    const montoUSD = Math.round((montoARS / tiPoCambioUSD) * 100); // Pasamos el monto a centavos de dolar.
    
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: ' Servicio de peluqueria '
                },
                unit_amount: montoUSD
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: `${FRONTEND_URL}/pago-exitoso?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${FRONTEND_URL}/pago-cancelado`,
        metadata: {
            pago_id: pago.id
        }
    });
    console.log('ID del pago antes de crear sesión:', pago.id);
    //console.log("Session creada: ", session.success_url, session.cancel_url);
    return session;
};