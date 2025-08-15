import { Servicio } from "../../../Servicio/servicio.entity.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";

export class VerMiTurno {
    constructor(private readonly repo:ServicioRepository){};

    async ejecutar(codSer:number):Promise<Servicio | string>{
        const servicio = await this.repo.buscarServicio(codSer);
        if(!servicio){
            return `No se ha encontrado el servicio con codigo: ${codSer}.`;
        };

        const servicioConTurno = await this.repo.buscarMiTurno(servicio);
        return servicioConTurno;
    };
};