import { Pago } from "../../../pago/pago.entity.js";
import { PagoRepository } from "../../interfaces/PagoRepository.js";
import Stripe from "stripe";
import { EntityManager } from "@mikro-orm/core";

export class ProcesarEventoStripe {
    constructor(private readonly repo:PagoRepository) {};

    async ejecutar(event: Stripe.Event):Promise<string[]>{
        const errores:string[] = [];
        switch(event.type){
            case 'checkout.session.completed':{
                const session = event.data.object as Stripe.Checkout.Session;
                const pagoId = session.metadata?.pago_id;
                if(!pagoId){
                    errores.push(`Webhook recibido sin "pago_id" en metadata. No se puede actualizar.`);
                    return errores;
                };

                const pago = await this.repo.buscarPago(Number(pagoId));
                if(!pago){
                    errores.push(`No se encontró un pago con ID ${pagoId}.`);
                    return errores;
                };

                pago.estado = 'Pagado';
                await this.repo.guardar(pago);
                console.log(`Pago con ID ${pagoId} actualizado a "Pagado".`);
                break;
            };
            case 'payment_intent.payment_failed': {
                console.log('Pago fallido recibido. Se esta implementado...');
                break;
            };
            default: console.log(`Evento no manejado (aun): ${event.type}`);
        };
        return errores;
    };
};