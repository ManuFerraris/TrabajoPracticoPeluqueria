import { Turno } from "../../../turno/turno.entity.js";
import { PeluqueroRepository } from "../../interfaces/PeluqueroRepository.js";

export class GetMisTurnos{
    constructor(private readonly repo:PeluqueroRepository){};

    async ejecutar(codigo_pel:number):Promise<{turnos: Turno[], cantTurnosHoy:number} | string>{
        const peluquero = await this.repo.buscarPeluquero(codigo_pel);
        if(!peluquero){
            return `El peluquero con codigo ${codigo_pel} no existe.`
        };
        const turnos =  await this.repo.getMisTurnos(codigo_pel);
        const hoy = new Date();
        const turnosHoy = turnos.filter(turno =>{
            const fechaTurno = new Date(turno.fecha_hora);
            return fechaTurno.toDateString() === hoy.toDateString()
        });
        return {turnos, cantTurnosHoy: turnosHoy.length};
    };
};