import { PagoRepository } from "../../interfaces/PagoRepository.js";
import { enviarReciboPorEmail } from "../../../shared/email/emailService.js";
import Stripe from "stripe";

export class ProcesarEventoStripe {
    constructor(private readonly repo:PagoRepository) {};

    async ejecutar(event: Stripe.Event):Promise<string[]>{
        const errores:string[] = [];
        switch(event.type){
            case 'checkout.session.completed':{
                const session = event.data.object as Stripe.Checkout.Session;
                const pagoId = session.metadata?.pago_id;
                if(!pagoId){
                    errores.push(`Webhook recibido sin "pago_id" en metadata. No se puede actualizar en sesion completa.`);
                    return errores;
                };
                const pago = await this.repo.buscarPago(Number(pagoId));
                if(!pago){
                    errores.push(`No se encontró un pago con ID ${pagoId}.`);
                    return errores;
                };
                pago.estado = 'Pagado';
                await this.repo.guardar(pago);
                await enviarReciboPorEmail(pago);
                console.log(`Pago con ID ${pagoId} actualizado a "Pagado".`);
                break;
            };

            case 'payment_intent.succeeded': {
                console.log('Pago exitoso recibido. Se esta implementado...');
                const intento = event.data.object as Stripe.PaymentIntent;
                const pagoId = intento.metadata?.pago_id;
                if(!pagoId){
                    errores.push(`Webhook recibido sin "pago_id" en metadata. No se puede actualizar en sesion exitosa.`);
                    return errores;
                };
                const pago = await this.repo.buscarPago(Number(pagoId));
                if(!pago){
                    errores.push(`No se encontró un pago con ID ${pagoId}.`);
                    return errores;
                };
                pago.estado = 'Pagado';
                await this.repo.guardar(pago);
                await enviarReciboPorEmail(pago);
                console.log(`Pago con ID ${pagoId} actualizado a "Pagado" por payment_intent.succeeded.`);
                break;
            };

            case 'payment_intent.payment_failed': {
                const intento = event.data.object as Stripe.PaymentIntent;
                const pagoId = intento.metadata?.pago_id;
                if(!pagoId){
                    errores.push(`Webhook recibido sin "pago_id" en metadata. No se puede actualizar en pago fallido.`);
                    return errores;
                };
                const pago = await this.repo.buscarPago(Number(pagoId));
                if(!pago){
                    errores.push(`No se encontró un pago con ID ${pagoId}.`);
                    return errores;
                };
                pago.estado = 'Fallido';
                await this.repo.guardar(pago);
                console.log(`Pago con ID ${pagoId} actualizado a "Fallido".`);
                break;
            };

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                const pagoId = charge.metadata?.pago_id;
                if(!pagoId){
                    errores.push(`Webhook recibido sin "pago_id" en metadata. No se puede actualizar en reembolso.`);
                    return errores;
                };
                const pago = await this.repo.buscarPago(Number(pagoId));
                if(!pago){
                    errores.push(`No se encontró un pago con ID ${pagoId}.`);
                    return errores;
                };
                pago.estado = 'Reembolsado';
                await this.repo.guardar(pago);
                console.log(`Pago con ID ${pagoId} actualizado a "Reembolsado".`);
                break;
            };
            
            case 'checkout.session.expired': {
                const session = event.data.object as Stripe.Checkout.Session;
                const pagoId = session.metadata?.pago_id;
                if(!pagoId){
                    errores.push(`Webhook recibido sin "pago_id" en metadata. No se puede actualizar en sesion expirada.`);
                    return errores;
                };
                const pago = await this.repo.buscarPago(Number(pagoId));
                if(!pago){
                    errores.push(`No se encontró un pago con ID ${pagoId}.`);
                    return errores;
                };
                pago.estado = 'Expirado';
                await this.repo.guardar(pago);
                console.log(`Pago con ID ${pagoId} actualizado a "Expirado".`);
                break;
            };
            default: console.log(`Evento no manejado (aun): ${event.type}`);
        };
        return errores;
    };
};