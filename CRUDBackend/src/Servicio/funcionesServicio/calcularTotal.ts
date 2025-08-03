import { RegistrarServicioDTO } from "../../application/dtos/RegistrarServicioDTO.js";
import { Turno } from "../../turno/turno.entity.js";
import { TipoServicio } from "../../TipoServicio/tiposervicio.entity.js";

export function calcularTotal(dto: RegistrarServicioDTO, turno: Turno, tipoServicio: TipoServicio): { total: number, adicional_adom: number } {
    const porcentaje = turno.porcentaje / 100;
    const base = tipoServicio.precio_base ?? 0;
    const adicional = turno.tipo_turno === 'A Domicilio' ? dto.monto * porcentaje : 0;

    let total = dto.monto + base + adicional;
    if (dto.medio_pago === 'Mercado Pago') {
        total *= 1.05;
    }

    return { total, adicional_adom: adicional };
}