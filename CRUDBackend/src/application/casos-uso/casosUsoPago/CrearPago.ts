import { EntityManager } from "@mikro-orm/core";
import { PagoRepository } from "../../interfaces/PagoRepository.js";
import { Turno } from "../../../turno/turno.entity.js";
import { Pago } from "../../../pago/pago.entity.js";
import { crearInstanciaPago, crearSessionStripe } from "./PagoEfectivo-Stripe.js";
import Stripe from "stripe";

export class CrearPago {
    constructor(private readonly repo: PagoRepository){};

    async ejecutar(codTur:number, metodo:string, em:EntityManager):Promise<Stripe.Checkout.Session | string[] | Pago>{

        const errores:string[] = [];
        if (!metodo || (metodo !== 'Efectivo' && metodo!== 'Stripe')) {
            errores.push('El método de pago requerido es "Stripe" o "Efectivo".');
            return errores;
        };

        const turno = await em.findOne(Turno, { codigo_turno: Number(codTur) }, { populate: ['servicio'] }); // NOTAR EL POPULATE
        if (!turno) {
            errores.push('Turno no encontrado.');
            return errores;
        };

        const pagoExistente = await em.findOne(Pago, { turno });
        if (pagoExistente) {
            errores.push('Ya existe un pago para este turno.');
            return errores;
        };

        const pago = await crearInstanciaPago(turno);
        await this.repo.guardar(pago);

        if(pago.metodo === 'Efectivo'){
            return pago;
        } else {
            const session = await crearSessionStripe(pago);
            return session;
        };
    };
};