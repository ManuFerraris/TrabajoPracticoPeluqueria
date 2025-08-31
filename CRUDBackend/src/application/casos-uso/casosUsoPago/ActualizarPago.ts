import { Pago } from "../../../pago/pago.entity.js";
import { PagoDTO, validarPagoDTO } from "../../dtos/RegistrarPagoDTO.js";
import { PagoRepository } from "../../interfaces/PagoRepository.js";
import { EntityManager } from "@mikro-orm/core";

export class ActualizarPago {
    constructor(private readonly repo: PagoRepository ){};

    async ejecutar(dto:PagoDTO, em:EntityManager, codPago:number, actualizacion:boolean):Promise<{ errores: string[], pagoActualizado?: Pago}>{
        const pagoAActualizar = await this.repo.buscarPago(codPago);
        if(!pagoAActualizar){
            return {errores: [`El pago con codigo ${codPago} no existe.`]};
        };
        
        const {errores, turno} = await validarPagoDTO(dto, em, codPago, actualizacion);
        if(errores.length > 0){
            return {errores}
        };
        if(!turno){
            return {errores: [`No se encontro el turno con codigo: ${dto.turno_codigo_turno}.`]};
        };

        if(dto.metodo){ pagoAActualizar.metodo = dto.metodo };
        if(dto.monto) { pagoAActualizar.monto = dto.monto };
        if(dto.estado){ pagoAActualizar.estado = dto.estado };
        if(dto.fecha_hora){ pagoAActualizar.fecha_hora = new Date (dto.fecha_hora) };
        if(dto.turno_codigo_turno){ pagoAActualizar.turno = turno };
        
        await this.repo.guardar(pagoAActualizar);
        return { errores: [], pagoActualizado: pagoAActualizar};
    };
};