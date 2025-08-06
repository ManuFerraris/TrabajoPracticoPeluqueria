import { Peluquero } from "../../peluquero/peluqueros.entity.js"

export interface PeluqueroRepository {
    getAllPeluqueros():Promise<Peluquero[]>;
    buscarPeluquero(codigo_peluquero:number):Promise<Peluquero | null>;
    guardar(peluquero:Peluquero):Promise<Peluquero>;
    eliminarPeluquero(peluquero:Peluquero):Promise<void>;
    getAllPeluquerosConTurnosYCLientes():Promise<Peluquero[]>;
};