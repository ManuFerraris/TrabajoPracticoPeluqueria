import { EntityManager } from "@mikro-orm/core";
import { Servicio } from "../Servicio/servicio.entity.js";
import { Turno } from "../turno/turno.entity.js";
import { TipoServicio } from "../TipoServicio/tiposervicio.entity.js";
import { AltaServicioDTO } from "./AltaTurno.js";
import { calcularTotal } from "../Servicio/funcionesServicio/calcularTotal.js";

export async function crearServicioDesdeDTO(
    dto:AltaServicioDTO,
    codTur:number,
    em:EntityManager
):Promise<Servicio | string[]>{
    const errores: string[] = [];

    const turno = await em.findOne(Turno, {codigo_turno:codTur});
    if(!turno){
        errores.push(`No se ha encontrado el turno con codigo ${codTur}`)
        return errores;
    };

    const tipoServicio = await em.findOne(TipoServicio, {codigo_tipo:dto.tipo_servicio_codigo})
    if(!tipoServicio){
        errores.push(`No se ha encontrado el tipo de servicio con codigo ${dto.tipo_servicio_codigo}`);
        return errores;
    };

    if(errores.length > 0) return errores;

    const {total, adicional_adom} = calcularTotal(dto, turno, tipoServicio);

    const servicio = new Servicio();
    servicio.monto = Number(tipoServicio.precio_base);
    servicio.estado = "Pendiente";
    servicio.adicional_adom = adicional_adom;
    servicio.ausencia_cliente = "Esperando atencion";
    servicio.medio_pago = dto.medio_pago;
    servicio.turno = turno;
    servicio.tipoServicio = tipoServicio;
    servicio.total = total;

    return servicio;
};