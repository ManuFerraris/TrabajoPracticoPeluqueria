import { Cliente } from './clientes.entity.js';
import { em } from '../shared/db/orm.js';

//Metodos del cliente
export class ClienteRepository {
    //busca al cliente por email (devuelve null si no lo encuentra)
    static async findByEmail(email: string): Promise<Cliente | null> {
        return em.findOne(Cliente, { email });
    };
};

