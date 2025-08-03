import { Servicio } from "../../../Servicio/servicio.entity.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";

export class EliminarServicio {
    constructor(private readonly repo:ServicioRepository){};

    async ejecutar(codigo:number):Promise<string[]>{
        const errores: string[] = [];
        
        const servicio = await this.repo.buscarServicio(codigo);

        if(!servicio){
            errores.push('Servicio no encontrado.');
            return errores;
        };

        if(servicio.turno){
            errores.push('El servicio tiene un turno asociado');
            return errores; 
        };
        
        await this.repo.eliminarServicio(servicio);

        return errores; // Retorna un array vacío si no hay errores
    }
}