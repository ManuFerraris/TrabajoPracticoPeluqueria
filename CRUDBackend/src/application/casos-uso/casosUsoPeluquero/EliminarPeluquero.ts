import { Peluquero } from "../../../peluquero/peluqueros.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";
import { Turno } from "../../../turno/turno.entity.js";
import { findAll } from "../../../peluquero/peluquero.controller.js";

export class EliminarPeluquero {
    constructor(private readonly repo: PeluqueroRepository){};

    async ejecutar(codigo_peluquero:number):Promise<string[]>{
        const errores: string[] = [];
        const peluquero = await this.repo.buscarPeluquero(codigo_peluquero);
        if(!peluquero){
            errores.push('Peluquero no encontrado.');
            return errores;
        };

        if(Array.isArray(peluquero.turnos) && peluquero.turnos.length > 0 ){
            //console.log(peluquero.turnos);
            errores.push('El peluquero tiene turnos asignados.');
            return errores;
        };

        await this.repo.eliminarPeluquero(peluquero);
        return errores;
    }
}