import { ClienteRepositoryORM } from "../shared/db/ClienteRepositoryORM.js";
import { PeluqueroRepositoryORM } from "../shared/db/PeluqueroRepositoryORM.js";
import { EntityManager } from "@mikro-orm/core";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";


export async function findUserByEmail(email:string, em:EntityManager):Promise<Cliente | Peluquero | null>{
    const clienteRepo = new ClienteRepositoryORM(em);
    const peluqueroRepo = new PeluqueroRepositoryORM(em);

    const cliente = await clienteRepo.findByEmail(email);
    if(cliente) return cliente;

    const peluquero = await peluqueroRepo.findByEmail(email);
    
    return peluquero ||  null;
};