import { repository } from "../shared/repository.js";
import { Peluquero } from "./peluqueros.entity.js";


const peluqueros: Peluquero[] = [
    new Peluquero(
    "Leon",
    88,
    new Date("2006-02-26T00:00:00Z"),
    ["Sucursal"]
    ),
]

export class PeluqueroRepository implements repository<Peluquero>{

    public async findAll(): Promise<Peluquero[] | undefined>{
        return await peluqueros
    }

    public async getOne(item: { codigo: number; }): Promise<Peluquero | undefined> {
        return await peluqueros.find((peluquero)=> peluquero.codigo === item.codigo)
    }

    public async add(item: Peluquero): Promise<Peluquero | undefined> {
        await peluqueros.push(item)
        return item
    }

    public async update(item: Peluquero): Promise<Peluquero | undefined> {
        const peluqueroCodigox = await peluqueros.findIndex((peluquero) => peluquero.codigo === item.codigo)
        
        if(peluqueroCodigox !== -1){ //no lo encontro
            peluqueros[peluqueroCodigox] = {...peluqueros[peluqueroCodigox], ...item}
            return peluqueros[peluqueroCodigox]
    }return undefined; // Devuelve undefined si no se encuentra el peluquero
    }

    public async delete(item: { codigo: number; }): Promise<Peluquero | undefined> {
        const peluqueroCodigox = await peluqueros.findIndex(peluquero => peluquero.codigo === item.codigo)

        if(peluqueroCodigox !== -1){
            const deletedPeluqueros = peluqueros[peluqueroCodigox]
            peluqueros.splice(peluqueroCodigox, 1)
            return deletedPeluqueros
        }
    }
}