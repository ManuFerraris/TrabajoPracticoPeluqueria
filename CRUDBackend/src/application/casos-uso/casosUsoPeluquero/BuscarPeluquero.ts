import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";

export class BuscarPeluquero {
    constructor(private readonly repo: PeluqueroRepository){};

    async ejecutar(codigo_peluquero:number):Promise<Peluquero | null>{
        return await this.repo.buscarPeluquero(codigo_peluquero);
    };
};