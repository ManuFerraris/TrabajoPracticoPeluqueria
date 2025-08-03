import { Servicio } from "../../../Servicio/servicio.entity.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";

export class ListarServicios {
    constructor(private readonly repo: ServicioRepository){};

    async ejecutar():Promise<Servicio[]>{
        const servicios = await this.repo.getAllServicios();
        return servicios;
    };
}