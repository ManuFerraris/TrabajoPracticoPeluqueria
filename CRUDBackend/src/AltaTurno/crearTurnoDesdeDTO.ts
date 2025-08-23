import { AltaTurnoDTO } from "./AltaTurno.js";
import { EntityManager } from "@mikro-orm/core";
import { Turno } from "../turno/turno.entity.js";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
import { validarHorarioLaboral } from "../turno/funcionesTurno/validarHorarioLaboral.js";
import { validarTurnoUnicoPorDia } from "../turno/funcionesTurno/validarTurnoUnicoPorDia.js";

export async function crearTurnoDesdeDTO(
    dto: AltaTurnoDTO,
    em: EntityManager ):Promise<Turno | string[]> {

    const errores: string[] = [];

    const cliente = await em.findOne(Cliente, { codigo_cliente: dto.codigo_cliente });
    if (!cliente){
        errores.push("El cliente no existe.");
        return errores;
    };
    
    const peluquero = await em.findOne(Peluquero, { codigo_peluquero: dto.codigo_peluquero });
    if (!peluquero){
        errores.push("El peluquero no existe.");
        return errores;
    };
        
    const fechaTurno = new Date(dto.fecha_hora);
    console.log("Fecha turno: ", fechaTurno);
    if (isNaN(fechaTurno.getTime())) {
        errores.push("La fecha y hora no es válida.");
        return errores;
    };
    
    const fechaHoy = new Date().toISOString().split('T')[0];
    const dateFecha_hora = fechaTurno.toISOString().split('T')[0];
    
    if(!dto.fecha_hora || dateFecha_hora < fechaHoy){
        errores.push('La fecha y hora no pueden ser menores a la actual');
    };
    
    if(dto.tipo_turno != 'Sucursal' && dto.tipo_turno != 'A Domicilio'){
        errores.push('El tipo de turno debe ser "Sucursal" o "A Domicilio"');
    };
    
    if(dto.porcentaje < 0 || dto.porcentaje > 100){
        errores.push('El porcentaje debe estar entre 0 y 100');
    };
    
    const mensajeHorario = validarHorarioLaboral(dto.fecha_hora);
    if(mensajeHorario){
        errores.push(mensajeHorario)
    };
    
    const mensajeUnicoTurno = await validarTurnoUnicoPorDia(em, dto.codigo_cliente, fechaTurno);
    if(mensajeUnicoTurno){
        errores.push(mensajeUnicoTurno);
    };
    
    const fechaInicio = new Date(fechaTurno.getTime() - 30 * 60000);
    const fechaFin = new Date(fechaTurno.getTime() + 30 * 60000);
    
    const conflicto = await em.findOne(Turno, {
        peluquero: { codigo_peluquero: dto.codigo_peluquero },
        fecha_hora: { $gte: fechaInicio, $lte: fechaFin }
    });
    
    if (conflicto) errores.push("El peluquero ya tiene un turno dentro de los 30 minutos del horario solicitado.");

    if(errores.length > 0) return errores;

    const turno = new Turno();
    turno.cliente = cliente;
    turno.peluquero = peluquero;
    turno.fecha_hora = new Date(dto.fecha_hora);
    turno.tipo_turno = dto.tipo_turno;
    turno.estado = "Activo";
    turno.porcentaje = dto.tipo_turno === 'A Domicilio' ? 25 : 0;

    return turno;
};