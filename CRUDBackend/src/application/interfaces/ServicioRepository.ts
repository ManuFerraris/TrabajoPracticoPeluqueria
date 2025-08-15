import { Servicio } from "../../Servicio/servicio.entity.js";

export interface ServicioRepository {
    buscarServicio(codigo_servicio: number):Promise<Servicio | null>;
    guardar(servicio:Servicio):Promise<void>;
    eliminarServicio(servico: Servicio):Promise<void>;
    obtenerMontoTotalMensual(desde:Date, hasta:Date):Promise<Servicio[]>;
    getAllServicios():Promise<Servicio[]>;
    buscarMiTurno(servicio:Servicio):Promise<Servicio>;
};