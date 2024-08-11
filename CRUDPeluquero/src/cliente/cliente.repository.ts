import { repository } from "../shared/repository.js";
import { Cliente } from "./clientes.entity.js";

//Cliente de prueba para ver si es devuelto
const clientes: Cliente[] = [
    new Cliente(
    45,
    45521084,
    "Jose Chavez",
    "17 y 41 nro 975",
    "ferrarismanu@gmail.com",
    "2473448855"
    ),
]

export class ClienteRepository implements repository<Cliente>{

    public async findAll(): Promise<Cliente[] | undefined> {
        return await clientes
    }

    public async getOne(item: { codigo: number; }): Promise<Cliente | undefined> {
        return await clientes.find((cliente)=> cliente.codigo === item.codigo)
    }

    public async add(item: Cliente): Promise<Cliente | undefined> {
        await clientes.push(item)
        return item
    }

    public async update(item: Cliente): Promise<Cliente | undefined> {
        const codigoClienteIndex = await clientes.findIndex((cliente) => cliente.codigo === item.codigo);

        if(codigoClienteIndex !== -1){ //no lo encontro
            clientes[codigoClienteIndex] = {...clientes[codigoClienteIndex], ...item}
            return clientes[codigoClienteIndex]
    }return undefined; // Devuelve undefined si no se encuentra el peluquero
    }

    public async delete(item: { codigo: number; }): Promise<Cliente | undefined> {
        const codigoClienteIndex = await clientes.findIndex(clientes => clientes.codigo === item.codigo)

        if(codigoClienteIndex !== -1){
            const deletedClientes = clientes[codigoClienteIndex]
            clientes.splice(codigoClienteIndex, 1)
            return deletedClientes
        }
    }

}