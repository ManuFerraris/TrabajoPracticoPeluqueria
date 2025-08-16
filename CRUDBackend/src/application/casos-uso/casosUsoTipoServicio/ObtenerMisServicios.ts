import { TipoServicio } from "../../../TipoServicio/tiposervicio.entity.js";
import { TipoServicioRepository } from "../../interfaces/TipoServicioRepository.js";

export class ObtenerMisServicios{
    constructor(private readonly repo: TipoServicioRepository){};

    async ejecutar(codTS:number):Promise<TipoServicio | string>{

        const tipoServico = await this.repo.obtenerTipoServicio(codTS);
        if(!tipoServico){
            return `No se ha encontrado el tipo de servicio con el codigo ${codTS}`;
        };

        const tipoServicioConServicios = await this.repo.buscarMisServicios(tipoServico);
        return tipoServicioConServicios;
    };
};