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

    public findAll(): Peluquero[] | undefined {
        return peluqueros
    }

    public getOne(item: { codigo: number; }): Peluquero | undefined {
        return peluqueros.find((peluquero)=> peluquero.codigo === item.codigo)
    }

    public add(item: Peluquero): Peluquero | undefined {
        peluqueros.push(item)
        return item
    }

    public update(item: Peluquero): Peluquero | undefined {
        const peluqueroCodigox = peluqueros.findIndex((peluquero) => peluquero.codigo === item.codigo)
        
        if(peluqueroCodigox !== -1){ //no lo encontro
            peluqueros[peluqueroCodigox] = {...peluqueros[peluqueroCodigox], ...item}
            return peluqueros[peluqueroCodigox]
    }return undefined; // Devuelve undefined si no se encuentra el peluquero
    }

    public delete(item: { codigo: number; }): Peluquero | undefined {
        const peluqueroCodigox = peluqueros.findIndex(peluquero => peluquero.codigo === item.codigo)

        if(peluqueroCodigox !== -1){
            const deletedPeluqueros = peluqueros[peluqueroCodigox]
            peluqueros.splice(peluqueroCodigox, 1)
            return deletedPeluqueros
        }
    }
}