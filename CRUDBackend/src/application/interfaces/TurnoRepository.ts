import { Turno } from "../../turno/turno.entity.js";

export interface TurnoRepository {
    buscarPorFecha(desde:Date, hasta:Date): Promise<Turno[]>;
    buscarTurnoCanceladoPorMes(desde: Date, hasta:Date): Promise<Turno[]>;
    getAllTurnos():Promise<Turno[]>;
    buscarTurno(codigo_turno: number):Promise<Turno | null>;
    eliminarTurno(turno: Turno):Promise<void>;
    guardar(turno:Turno):Promise<void>;
};