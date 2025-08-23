import { RegistrarServicioDTO } from "../../application/dtos/RegistrarServicioDTO.js";
import { Turno } from "../../turno/turno.entity.js";
import { TipoServicio } from "../../TipoServicio/tiposervicio.entity.js";

export function calcularTotal(dto: RegistrarServicioDTO, turno: Turno, tipoServicio: TipoServicio): { total: number, adicional_adom: number } {
    console.log("Turno pasado a calcularTotal recientemente: ", turno);
    const porcentaje = turno.porcentaje / 100; 
    console.log("Porcentaje del turno creado recientemente: ", porcentaje);

    const base = Number(tipoServicio.precio_base ?? 0);
    const adicional = turno.tipo_turno === 'A Domicilio' ? base * porcentaje : 0;

    let total = base + adicional;
    if (isNaN(total)) {
        throw new Error("El total calculado es inválido. Verificá precio_base y tipo_turno.");
    };

    if (dto.medio_pago === 'Mercado Pago') total *= 1.05;
    
    return { total, adicional_adom: adicional };
};