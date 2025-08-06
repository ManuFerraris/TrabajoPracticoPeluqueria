import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";

export class FindAll {
    constructor( private readonly repo: PeluqueroRepository){};

    async ejecutar(): Promise<Peluquero[]> {
        return await this.repo.getAllPeluqueros();
    };
};