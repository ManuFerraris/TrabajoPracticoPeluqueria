import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";

export class BuscarPeluqueroPorEmail{
    constructor(private readonly repo: PeluqueroRepository){};

    async ejecutar(email:string):Promise<Peluquero | null>{
        return await this.repo.findByEmail(email);
    };
};