import { Cliente } from "../../cliente/clientes.entity.js";

export interface ClienteRepository {
    obtenerClientes():Promise<Cliente[]>;
    getOne(codigo_cliente:number):Promise<Cliente | null>;
    guardar(cliente:Cliente):Promise<Cliente>;
    eliminarCliente(clienteAEliminar:Cliente):Promise<void>;
    findByEmail(email: string): Promise<Cliente | null>;
};