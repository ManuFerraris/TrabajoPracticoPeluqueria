import { Cliente } from "../../../cliente/clientes.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";

export class ObtenerCliente {
    constructor(private readonly repo:ClienteRepository){};

    async ejecutar(codigo_cliente: number):Promise<Cliente | null>{
        return await this.repo.getOne(codigo_cliente);
    };
};