import { Cliente } from "../../../cliente/clientes.entity.js";
import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";
import { EntityManager } from "@mikro-orm/core";

export class MisTurnosCliente{
    constructor(private readonly repo:TurnoRepository){};

    async ejecutar(codCli:number, em:EntityManager):Promise<Turno[] | string>{

        const cliente = await em.findOne(Cliente, { codigo_cliente: codCli });
        if(!cliente){
            return `No existe el cliente con codigo: ${codCli}`;
        };
        const turnos = await this.repo.buscarTurnoCliente(cliente);
        return turnos;
    };
};