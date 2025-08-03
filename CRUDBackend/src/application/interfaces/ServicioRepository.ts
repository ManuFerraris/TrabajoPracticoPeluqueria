import { Servicio } from "../../Servicio/servicio.entity.js";

export interface ServicioRepository {
    buscarServicio(codigo_servicio: number):Promise<Servicio | null>;
    eliminarServicio(servico: Servicio):Promise<void>;
};