import { Cliente } from "../../cliente/clientes.entity.js";
import { ClienteRepository } from "../../application/interfaces/ClienteRepository.js";
import { EntityManager } from "@mikro-orm/core";
import { Turno } from "../../turno/turno.entity.js";

export class ClienteRepositoryORM implements ClienteRepository {
    constructor(private readonly em:EntityManager){};

    async obtenerClientes(): Promise<Cliente[]> {
        return await this.em.find(Cliente, {});
    };

    async getOne(codigo_cliente: number): Promise<Cliente | null> {
        return this.em.findOne(Cliente, {codigo_cliente:codigo_cliente});
    };

    async eliminarCliente(clienteAEliminar: Cliente): Promise<void> {
        await this.em.removeAndFlush(clienteAEliminar);
        return;
    };

    async guardar(cliente: Cliente): Promise<Cliente> {
        await this.em.persistAndFlush(cliente);
        return cliente;
    };

    async findByEmail(email: string): Promise<Cliente | null> {
        return await this.em.findOne(Cliente, { email });
    };

    async misTurnosActivos(cliente: Cliente): Promise<Turno[]> {
        return await this.em.find(Turno,
            {
                estado: 'Activo',
                cliente
            },
            {
                populate: [ "servicio.tipoServicio", "pago" ]
            }
        );
    };
};