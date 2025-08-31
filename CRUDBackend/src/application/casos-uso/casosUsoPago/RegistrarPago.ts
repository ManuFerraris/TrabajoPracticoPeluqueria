import { Pago } from "../../../pago/pago.entity.js";
import { PagoDTO, validarPagoDTO } from "../../dtos/RegistrarPagoDTO.js";
import { PagoRepository } from "../../interfaces/PagoRepository.js";
import { EntityManager } from "@mikro-orm/core";

export class RegistrarPago{
    constructor(private readonly repo:PagoRepository){};

    async ejecutar(dto:PagoDTO, em:EntityManager):Promise<string[] | Pago>{
        const {errores, turno} = await validarPagoDTO(dto, em);
        if(errores.length > 0){
            return errores;
        };

        if(turno === null){
            return errores;
        };

        const pago = new Pago();
        pago.monto = dto.monto;
        pago.estado = dto.estado;
        pago.metodo = dto.metodo;
        pago.fecha_hora = dto.fecha_hora ? new Date(dto.fecha_hora) : new Date();
        pago.turno = turno;

        await this.repo.guardar(pago);
        return pago;
    };
};