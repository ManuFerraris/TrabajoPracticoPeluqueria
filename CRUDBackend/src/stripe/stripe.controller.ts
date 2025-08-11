import { Request, Response } from 'express';
import Stripe from 'stripe';
import { orm } from '../shared/db/orm.js';
import { Pago } from '../pago/pago.entity.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function handleStripeWebhook(req: Request, res: Response) {
  // El fork crea una copia de la base de datos
  // Esto asegura que esta operación no interfiera con otras partes de tu app.
  const em = orm.em.fork();

  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.log(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Si la firma es válida, procesamos el evento.
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // --- CAMBIO 2: LEER EL ID DE NUESTRO PAGO ---
      // Recuperamos el 'pago_id' que guardamos en la metadata cuando creamos la sesión.
      const pagoId = session.metadata?.pago_id;

      if (pagoId) {
        try {
          // --- CAMBIO 3: BUSCAR Y ACTUALIZAR EL PAGO ---
          // Usamos el 'pagoId' para encontrar el pago correcto en nuestra base de datos.
          const pago = await em.findOne(Pago, { id: Number(pagoId) });

          if (pago) {
            // Si lo encontramos, cambiamos su estado a "Pagado".
            pago.estado = 'Pagado';
            await em.flush(); // Guardamos el cambio en la base de datos.
            
            console.log(`✅ ¡Éxito! Pago con ID ${pagoId} actualizado a "Pagado".`);
          } else {
            console.error(`Error: El webhook funcionó, pero no se encontró un pago con ID ${pagoId}.`);
          }
        } catch (dbError: any) {
            console.error(`Error al actualizar la base de datos: ${dbError.message}`);
        }
      } else {
        console.warn('Webhook recibido, pero sin "pago_id" en la metadata. No se puede actualizar.');
      }
      break;

    case 'payment_intent.payment_failed':
      // ... (lógica para pagos fallidos)
      break;
    
    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  // Respondemos a Stripe para que sepa que todo salió bien.
  res.status(200).send();
}