import { Servicio } from "../../../Servicio/servicio.entity.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";

export class BuscarServicio {
    constructor(private readonly repo:ServicioRepository){};

    async ejecutar(codigo_servicio:number):Promise<Servicio | null>{
        return await this.repo.buscarServicio(codigo_servicio);
    };
};