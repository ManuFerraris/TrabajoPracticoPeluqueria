import { EntityManager } from "@mikro-orm/core";
import { PagoRepository } from "../../interfaces/PagoRepository.js";
import { Turno } from "../../../turno/turno.entity.js";
import { Pago } from "../../../pago/pago.entity.js";
import { crearInstanciaPago, crearSessionStripe } from "./PagoEfectivo-Stripe.js";
import { enviarReciboPorEmail } from "../../../shared/email/emailService.js";
import Stripe from "stripe";

export class CrearPago {
    constructor(private readonly repo: PagoRepository){};

    async ejecutar(codTur:number, metodo:string, em:EntityManager):Promise<Stripe.Checkout.Session | string[] | Pago>{

        const errores:string[] = [];
        if (!metodo || (metodo !== 'Efectivo' && metodo!== 'Stripe')) {
            errores.push('El método de pago requerido es "Stripe" o "Efectivo".');
            return errores;
        };

        const turno = await em.findOne(Turno, { codigo_turno: Number(codTur) }, { populate: ['servicio', 'servicio.tipoServicio', 'cliente', 'peluquero'] }); // NOTAR EL POPULATE
        if (!turno) {
            errores.push('Turno no encontrado.');
            return errores;
        };

        const pagoExistente = await em.findOne(Pago, { turno });
        if (pagoExistente?.metodo === 'Stripe' && pagoExistente?.estado === 'Pendiente') {
            const session = await crearSessionStripe(pagoExistente);
            return session; // Si ya existe un pago para este turno, devolvemos el sessionId para reintentar.
        }; // Quizas el pago fallo por algun X motivo y se quiere reintentar.

        if(pagoExistente?.metodo === 'Efectivo' && pagoExistente?.estado === 'Pendiente'){
            await enviarReciboPorEmail(pagoExistente);
            return pagoExistente; // Si ya existe un pago en efectivo pendiente, lo devolvemos.
        };
        
        const pago = await crearInstanciaPago(turno);
        await this.repo.guardar(pago);

        if(pago.metodo === 'Efectivo'){
            await enviarReciboPorEmail(pago);
            return pago;
        } else {
            const session = await crearSessionStripe(pago);
            return session;
        };
    };
};