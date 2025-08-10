import { Cliente } from "../../../cliente/clientes.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";

export class BuscarClientePorEmail{
    constructor(private readonly repo: ClienteRepository){};

    async ejecutar(email:string):Promise<Cliente | null>{
        return await this.repo.findByEmail(email);
    };
};