import { repository } from "../shared/repository.js";
import { Turno } from "./turno.entity.js";

const turnos: Turno[] = [
    new Turno(
        78,
        new Date("2006-02-26T00:00:00Z"),
        'A domicilio',
        25,
        'Activo'
    ),
]

export class TurnoRepository implements repository<Turno>{
    public findAll(): Turno[] | undefined {
        return turnos
    }

    public getOne(item: { codigo: number; }): Turno | undefined {
        return turnos.find((turno)=> turno.codigo === item.codigo)
    }

    public add(item: Turno): Turno | undefined {
        turnos.push(item)
        return item
    }

    public update(item: Turno): Turno | undefined {
        const codigoTurnoIndex = turnos.findIndex((turno) => turno.codigo === item.codigo);

        if(codigoTurnoIndex !== -1){ //no lo encontro
            turnos[codigoTurnoIndex] = {...turnos[codigoTurnoIndex], ...item}
            return turnos[codigoTurnoIndex]
    }return undefined;
    }

    public delete(item: { codigo: number; }): Turno | undefined {
        const codigoTurnoIndex = turnos.findIndex(turno => turno.codigo === item.codigo)

        if(codigoTurnoIndex !== -1){
            const deletedTurnos = turnos[codigoTurnoIndex]
            turnos.splice(codigoTurnoIndex, 1)
            return deletedTurnos
        }
    }
}