import { Localidad } from "../../../localidad/localidad.entity.js";
import { LocalidadRepository } from "../../interfaces/LocalidadRepository.js";
import { LocalidadDTO, validarLocalidadDTO } from "../../dtos/RegistrarLocalidadDTO.js";
import { EntityManager } from "@mikro-orm/core";

export class ActualizarLocalidad {
    constructor(private readonly repo: LocalidadRepository){};

    async ejecutar(dto: LocalidadDTO, codigo:number, em:EntityManager, actualizar:boolean):Promise<{ errores: string[], localidadActualizada?: Localidad}>{
        
        const localidadAActualizar = await this.repo.getOne(codigo);
        if(!localidadAActualizar){
            return {errores: [`La localidad con codigo ${codigo} no existe.`]}
        };
        
        const errores = await validarLocalidadDTO(dto, em, codigo, actualizar);
        if(errores.length > 0){
            return {errores}
        };

        if(dto.codigo_postal){ localidadAActualizar.codigo_postal = dto.codigo_postal };
        if(dto.descripcion) { localidadAActualizar.descripcion = dto.descripcion };
        if(dto.nombre){ localidadAActualizar.nombre = dto.nombre };
        if(dto.pais){ localidadAActualizar.pais = dto.pais };
        if(dto.provincia){ localidadAActualizar.provincia = dto.provincia };
        
        await this.repo.guardar(localidadAActualizar);
        return { errores: [], localidadActualizada: localidadAActualizar};
    };
};