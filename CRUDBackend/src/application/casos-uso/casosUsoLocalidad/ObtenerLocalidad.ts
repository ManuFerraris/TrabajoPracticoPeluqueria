import { Localidad } from "../../../localidad/localidad.entity.js";
import { LocalidadRepository } from "../../interfaces/LocalidadRepository.js";

export class BuscarLocalidad {
    constructor(private readonly repo:LocalidadRepository){};

    async ejecutar(codigoLocalidad:number):Promise<Localidad | null>{
        return await this.repo.getOne(codigoLocalidad);
    };
};