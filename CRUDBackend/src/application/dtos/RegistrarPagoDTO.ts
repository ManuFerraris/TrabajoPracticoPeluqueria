import { Pago } from "../../pago/pago.entity.js";
import { EntityManager } from "@mikro-orm/core";
import { Turno } from "../../turno/turno.entity.js";

export interface PagoDTO {
    metodo:'Efectivo' | 'Stripe';
    monto:number;
    estado: 'Pendiente' | 'Pagado';
    fecha_hora:string;
    turno_codigo_turno:number;
};

export async function validarPagoDTO(
    dto:PagoDTO,
    em:EntityManager,
    id?:number,
    actualizacion:boolean = false,):Promise<{errores:string[] , turno:Turno | null}>{

    const errores:string[] = [];
    let turno:Turno | null = null; 

    if(actualizacion){
        const pago = await em.findOne(Pago, {id});
        if(!pago){
            errores.push(`No se ha encontrado el pago con el codigo ${id}`);
            return {errores, turno};
        };
    };

    if((!dto.turno_codigo_turno || (typeof dto.turno_codigo_turno !== 'number')) && !actualizacion){
        errores.push('Codigo de turno invalido.');
    };

    turno = await em.findOne(Turno, {codigo_turno:dto.turno_codigo_turno});
    if(!turno){
        errores.push(`No se ha encontrado un turno con codigo ${dto.turno_codigo_turno}`);
        return {errores, turno};
    };

    if((!dto.metodo || (dto.metodo !== 'Efectivo' && dto.metodo !== 'Stripe')) && !actualizacion){
        errores.push('El metodo debe ser "Efectivo" o "Stripe".');
    };

    if((!dto.monto || dto.monto < 0) && !actualizacion){
        errores.push('El monto debe ser mayor a 0.');
    };

    if((!dto.estado || (dto.estado !== 'Pendiente' && dto.estado !== 'Pagado')) && !actualizacion){
        errores.push('El metodo debe ser "Efectivo" o "Stripe".');
    };
    
    const fechaAhora = new Date();
    const fechaDto = new Date(dto.fecha_hora);
    if((!dto.fecha_hora || (fechaDto < fechaAhora)) && !actualizacion){
        errores.push('La fecha no puede ser menor a este momento.');
    };

    return {errores, turno};
}