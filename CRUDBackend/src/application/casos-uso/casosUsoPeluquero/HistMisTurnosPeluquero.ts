import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";
import { EntityManager } from "@mikro-orm/core";

export class HistMisTurnosPeluquero{
    constructor(private readonly repo:TurnoRepository){};

    async ejecutar(codPel:number, em:EntityManager):Promise<Turno[] | string>{

        const peluquero = await em.findOne(Peluquero, { codigo_peluquero: codPel });
        if(!peluquero){
            return `No existe el cliente con codigo: ${codPel}`;
        };
        const turnos = await this.repo.buscarHistorialTurnoPeluquero(peluquero);
        return turnos;
    };
};