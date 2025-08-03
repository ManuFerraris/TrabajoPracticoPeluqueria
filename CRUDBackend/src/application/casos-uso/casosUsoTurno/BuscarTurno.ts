import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";

export class BuscarTurno {
    constructor(private readonly repo: TurnoRepository){};

    async ejecutar(codigo_turno:number):Promise<Turno | null>{
        return await this.repo.buscarTurno(codigo_turno);
    };
}