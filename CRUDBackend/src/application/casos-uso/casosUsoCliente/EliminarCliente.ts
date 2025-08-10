import { EntityManager } from "@mikro-orm/core";
import { Cliente } from "../../../cliente/clientes.entity.js";
import { Turno } from "../../../turno/turno.entity.js";
import { ClienteRepository } from "../../interfaces/ClienteRepository.js";

export class EliminarCliente {
    constructor(private readonly repo:ClienteRepository){};

    async ejecutar(codigo_cliente:number, em:EntityManager):Promise<string[]>{
        const errores:string[]=[];

        const clienteAEliminar = await this.repo.getOne(codigo_cliente);
        if(!clienteAEliminar){
            errores.push('Cliente a aliminar no encontrado.');
            return errores;
        };

        const turno = await em.find(
            Turno,
            {
                cliente:clienteAEliminar
            });
        if(turno.length > 0){
            errores.push('El cliente tiene turnos asignados.');
            return errores;
        };

        await this.repo.eliminarCliente(clienteAEliminar);
        return errores;
    }
}