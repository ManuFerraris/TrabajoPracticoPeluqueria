import { Localidad } from "../../../localidad/localidad.entity.js";
import { LocalidadRepository } from "../../interfaces/LocalidadRepository.js";
import { LocalidadDTO, validarLocalidadDTO } from "../../dtos/RegistrarLocalidadDTO.js";
import { EntityManager } from "@mikro-orm/core";

export class RegistrarLocalidad {
    constructor(private readonly repo:LocalidadRepository){};

    async ejecutar(dto:LocalidadDTO, em: EntityManager):Promise<Localidad | string[]>{

        const errores = await validarLocalidadDTO(dto, em);
        if(errores.length > 0){
            return errores;
        };

        const localidad = new Localidad();
        localidad.codigo_postal = dto.codigo_postal;
        localidad.descripcion = dto.descripcion;
        localidad.nombre = dto.nombre;
        localidad.pais = dto.pais;
        localidad.provincia = dto.provincia;

        const localidadGuardada = await this.repo.guardar(localidad);
        return localidadGuardada;
    };
};