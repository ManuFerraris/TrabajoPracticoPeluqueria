import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";

export class ListarTurnos {
    constructor (private readonly repo:TurnoRepository) {};

    async ejecutar():Promise<Turno[]> {
        return await this.repo.getAllTurnos();
    }
}