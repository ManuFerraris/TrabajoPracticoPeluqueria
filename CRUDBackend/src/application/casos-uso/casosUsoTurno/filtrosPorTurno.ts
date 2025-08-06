import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";

export class FiltroTurnoPorPeluqueroYEstado{
    constructor(private readonly repo:TurnoRepository){};

    async ejecutar(estado:string, codPel:number):Promise<Turno[]>{
        return await this.repo.getTurnosPorEstado(estado, codPel);

    };
};