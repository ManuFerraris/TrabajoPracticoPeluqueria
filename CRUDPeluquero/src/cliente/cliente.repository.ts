import { repository } from "../shared/repository.js";
import { Cliente } from "./clientes.entity.js";

//Cliente de prueba para ver si es devuelto
const clientes: Cliente[] = [
    new Cliente(
    45,
    45521084,
    "Jose",
    "Chavez",
    "17 y 41 nro 975",
    "ferrarismanu@gmail.com",
    "2473448855"
    ),
]

export class ClienteRepository implements repository<Cliente>{

    public findAll(): Cliente[] | undefined {
        return clientes
    }

    public getOne(item: { codigo: number; }): Cliente | undefined {
        return clientes.find((cliente)=> cliente.codigo === item.codigo)
    }

    public add(item: Cliente): Cliente | undefined {
        clientes.push(item)
        return item
    }

    public update(item: Cliente): Cliente | undefined {
        const codigoClienteIndex = clientes.findIndex((cliente) => cliente.codigo === item.codigo);

        if(codigoClienteIndex !== -1){ //no lo encontro
            clientes[codigoClienteIndex] = {...clientes[codigoClienteIndex], ...item}
            return clientes[codigoClienteIndex]
    }return undefined; // Devuelve undefined si no se encuentra el peluquero
    }

    public delete(item: { codigo: number; }): Cliente | undefined {
        const codigoClienteIndex = clientes.findIndex(clientes => clientes.codigo === item.codigo)

        if(codigoClienteIndex !== -1){
            const deletedClientes = clientes[codigoClienteIndex]
            clientes.splice(codigoClienteIndex, 1)
            return deletedClientes
        }
    }

}