import { Turno } from "../../../turno/turno.entity.js";
import { Cliente } from "../../../cliente/clientes.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";

export class MisTurnosActivos {
    constructor(private readonly repo: ClienteRepository){};

    async ejecutar(codCli:number):Promise<Turno[] | string>{
        const cliente = await this.repo.getOne(codCli);
        if(!cliente){
            return `El cliente con codigo: ${codCli} no existe.`
        };
        const turnos = await this.repo.misTurnosActivos(cliente);
        return turnos;
    };
};