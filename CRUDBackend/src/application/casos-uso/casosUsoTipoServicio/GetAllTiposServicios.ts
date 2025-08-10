import { TipoServicio } from "../../../TipoServicio/tiposervicio.entity.js";
import { TipoServicioRepository } from "../../interfaces/TipoServicioRepository.js";

export class TraerTiposServicios {
    constructor(private readonly repo:TipoServicioRepository){};

    async ejecutar():Promise<TipoServicio[]>{
        return await this.repo.listarTiposServicios();
    };
};