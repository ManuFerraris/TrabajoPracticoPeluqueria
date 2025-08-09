import { Localidad } from "../../localidad/localidad.entity.js";
import { LocalidadRepository } from "../../application/interfaces/LocalidadRepository.js";
import { EntityManager } from "@mikro-orm/core";

export class LocalidadRepositoryORM implements LocalidadRepository {
    constructor(private readonly em: EntityManager){};

    async getAll(): Promise<Localidad[]> {
        return await this.em.find(Localidad, {});
    };

    async getOne(codigoLocalidad:number):Promise<Localidad | null>{
        return await this.em.findOne(Localidad, 
            {
                codigo:codigoLocalidad
            }
        );
    };

    async guardar(localidad: Localidad):Promise<Localidad> {
        await this.em.persistAndFlush(localidad);
        return localidad;
    };

    async eliminarLocalidad(localidad:Localidad): Promise<void> {
        await this.em.removeAndFlush(localidad);
    }
};