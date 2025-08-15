import { Localidad } from "../../../localidad/localidad.entity.js";
import { Cliente } from "../../../cliente/clientes.entity.js";
import { LocalidadRepository } from "../../interfaces/LocalidadRepository.js";

export class GetMisClientes {
    constructor(private readonly repo:LocalidadRepository){};

    async ejecutar(codLoc:number):Promise<Localidad | string>{
        const localidad = await this.repo.getOne(codLoc);
        if(!localidad){
            return `No existe una localidad con el codigo: ${codLoc}.`;
        };

        const locConClientes = await this.repo.obtenerMisClientes(localidad);
        return locConClientes;
    };
};