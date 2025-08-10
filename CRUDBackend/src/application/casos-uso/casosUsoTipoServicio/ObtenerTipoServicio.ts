import { TipoServicio } from "../../../TipoServicio/tiposervicio.entity.js";
import { TipoServicioRepository } from "../../interfaces/TipoServicioRepository.js";

export class TraerTipoServicio{
    constructor(private readonly repo:TipoServicioRepository){};

    async ejecutar(codVal:number):Promise<TipoServicio | null>{
        return this.repo.obtenerTipoServicio(codVal);
    };
};