import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";

export class ListarTurnosCanceladosPorMes {
    constructor(private readonly repo: TurnoRepository) {};

    async ejecutar(mes:string):Promise<Turno[]> {
        const [anio, mesNumero] = mes.split("-").map(Number);
        const desde = new Date(anio, mesNumero -1, 1);
        const hasta = new Date(anio, mesNumero, 1);

        return await this.repo.buscarTurnoCanceladoPorMes(desde, hasta);
    }
}