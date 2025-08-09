import { Localidad } from "../../../localidad/localidad.entity.js";
import { LocalidadRepository } from "../../interfaces/LocalidadRepository.js";

export class ListarLocalidades {
    constructor(private readonly repo: LocalidadRepository){};

    async ejecutar():Promise<Localidad[]>{
        return await this.repo.getAll();
    }
};