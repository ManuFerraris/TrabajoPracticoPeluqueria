import { Turno } from "../../../turno/turno.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";

export class GetMisTurnos{
    constructor(private readonly repo:PeluqueroRepository){};

    async ejecutar(codigo_pel:number):Promise<Turno[] | string>{
        const peluquero = await this.repo.buscarPeluquero(codigo_pel);
        if(!peluquero){
            return `El peluquero con codigo ${codigo_pel} no existe.`
        };
        return await this.repo.getMisTurnos(codigo_pel);
    };
};