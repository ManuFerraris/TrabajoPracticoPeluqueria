import { Turno } from "../../../turno/turno.entity.js";
import { TurnoRepository } from "../../interfaces/TurnoRepository.js";
import { ServicioRepository } from "../../interfaces/ServicioRepository.js";

export class EliminarTurno {
    constructor(private readonly turnoRepo:TurnoRepository,
        private readonly servicioRepo:ServicioRepository ){};

    async ejecutar(codigo:number):Promise<string[]>{

        const errores: string[] = [];
        const turno = await this.turnoRepo.buscarTurno(codigo);
        if(!turno){
            errores.push('Turno no encontrado.');
            return errores;
        };

        if(turno.servicio){
            await this.servicioRepo.eliminarServicio(turno.servicio);
        };

        await this.turnoRepo.eliminarTurno(turno);
        return errores;
    };
};