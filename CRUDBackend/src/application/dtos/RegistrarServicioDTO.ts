import { EntityManager } from "@mikro-orm/mysql";
import { TipoServicio } from "../../TipoServicio/tiposervicio.entity.js";
import { Turno } from "../../turno/turno.entity.js";

export interface RegistrarServicioDTO {
    monto: number;
    estado: "Pendiente" | "Pago";
    ausencia_cliente: "Se presento" | "Esta ausente";
    medio_pago: "Mercado Pago" | "Efectivo";
    turno_codigo_turno: number;
    tipo_servicio_codigo: number;
};

export async function validarServicioDTO(
    dto: RegistrarServicioDTO,
    em: EntityManager,
    actualizacion:boolean = false):Promise<string[]>{
    const errores:string[] = [];
    
    const turno = await em.findOne(Turno, {codigo_turno: dto.turno_codigo_turno});
    if(!turno) errores.push("El turno no existe.");

    if(!actualizacion && turno?.servicio) errores.push("El turno ya tiene un servicio asociado.");

    const tipoServicio = await em.findOne(TipoServicio, {codigo_tipo: dto.tipo_servicio_codigo});
    if(!tipoServicio) errores.push("El Tipo de Servicio no existe.");

    if(dto.monto == null || dto.monto < 0){
        errores.push("El monto no puede ser menor a 0.");
    };

    if(dto.estado != 'Pendiente' && dto.estado != 'Pago'){
        errores.push("El estado solo puede ser 'Pendiente' o 'Pago'.");
    };

    if(dto.ausencia_cliente != 'Se presento' && dto.ausencia_cliente != 'Esta ausente'){
        errores.push("Solo es valido 'Se presento' o 'Esta ausente'.");
    };

    if(dto.medio_pago != 'Mercado Pago' && dto.medio_pago != 'Efectivo'){
        errores.push("El medio de pago solo puede ser 'Mercado Pago' o 'Efectivo'.");
    };

    const tip_tur = turno?.tipo_turno;
    if(!tip_tur){
        errores.push("El turno no tiene un tipo asignado")
    };

    return errores;
};