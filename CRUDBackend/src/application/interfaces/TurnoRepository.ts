import { Cliente } from "../../cliente/clientes.entity.js";
import { Peluquero } from "../../peluquero/peluqueros.entity.js";
import { Turno } from "../../turno/turno.entity.js";

export interface TurnoRepository {
    buscarPorFecha(desde:Date, hasta:Date): Promise<Turno[]>;
    buscarTurnoCanceladoPorMes(desde: Date, hasta:Date): Promise<Turno[]>;
    getAllTurnos():Promise<Turno[]>;
    buscarTurno(codigo_turno: number):Promise<Turno | null>;
    eliminarTurno(turno: Turno):Promise<void>;
    guardar(turno:Turno):Promise<void>;
    getTurnosPorEstado(estado: string, codPel:number):Promise<Turno[]>;
    buscarHistorialTurnoCliente(cliente:Cliente):Promise<Turno[]>;
    buscarHistorialTurnoPeluquero(peluquero:Peluquero):Promise<Turno[]>;
};