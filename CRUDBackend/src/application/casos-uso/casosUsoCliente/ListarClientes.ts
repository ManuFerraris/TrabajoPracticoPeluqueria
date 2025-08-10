import { Cliente } from "../../../cliente/clientes.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";

export class ListarClientes{
    constructor(private readonly repo: ClienteRepository){};

    async ejecutar():Promise<Cliente[]>{
        return await this.repo.obtenerClientes();
    }
}