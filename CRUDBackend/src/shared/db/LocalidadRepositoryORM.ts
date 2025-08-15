import { Localidad } from "../../localidad/localidad.entity.js";
import { LocalidadRepository } from "../../application/interfaces/LocalidadRepository.js";
import { EntityManager } from "@mikro-orm/core";
import { populate } from "dotenv";

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
    };

    async obtenerMisClientes(localidad: Localidad): Promise<Localidad> {
        return this.em.findOneOrFail(Localidad, localidad, {populate:['clientes']})
    };
};