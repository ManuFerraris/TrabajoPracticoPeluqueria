import { TipoServicio } from "../../../TipoServicio/tiposervicio.entity.js";
import { TipoServicioRepository } from "../../interfaces/TipoServicioRepository.js";
import { TipoServicioDTO, validarTipoServicioDTO } from "../../dtos/RegistrarTipoServicioDTO.js";
import { EntityManager } from "@mikro-orm/core";

export class ActualizarTipoServicio{
    constructor(private readonly repo: TipoServicioRepository){};

    async ejecutar(dto:TipoServicioDTO, em:EntityManager, codVal:number, actualizar:boolean):Promise<{errores: string[], tipoServicioActualizado?: TipoServicio}>{
        const tipoServicioAActualizar = await em.findOne(TipoServicio, {codigo_tipo: codVal});
        if(!tipoServicioAActualizar){
            return { errores: [`Tipo de servicio con codigo ${codVal} no encontrado.`] };
        };
        
        const {errores} = await validarTipoServicioDTO(dto, em, codVal, actualizar);
        if (errores.length > 0) return {errores};
        
        if(dto.descripcion !== undefined) { tipoServicioAActualizar.descripcion = dto.descripcion };
        if(dto.nombre !== undefined) { tipoServicioAActualizar.nombre = dto.nombre };
        if(dto.duracion_estimada) { tipoServicioAActualizar.duracion_estimada = dto.duracion_estimada };
        if(dto.precio_base) { tipoServicioAActualizar.precio_base = dto.precio_base};
        
        await this.repo.guardar(tipoServicioAActualizar);
        
        return { errores: [], tipoServicioActualizado: tipoServicioAActualizar };
    };
};