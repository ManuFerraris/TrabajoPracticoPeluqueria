import { Peluquero } from "../../peluquero/peluqueros.entity.js"
import { Turno } from "../../turno/turno.entity.js";

export interface PeluqueroRepository {
    getAllPeluqueros():Promise<Peluquero[]>;
    buscarPeluquero(codigo_peluquero:number):Promise<Peluquero | null>;
    guardar(peluquero:Peluquero):Promise<Peluquero>;
    eliminarPeluquero(peluquero:Peluquero):Promise<void>;
    getAllPeluquerosConTurnosYCLientes():Promise<Peluquero[]>;
    getMisTurnos(codigo_pel: number):Promise<Turno[]>;
};