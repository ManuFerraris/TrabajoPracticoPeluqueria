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
    
    public async findAll(): Promise<Turno[] | undefined> {
        return await turnos
    }

    public async getOne(item: { codigo: number; }): Promise<Turno | undefined> {
        return await turnos.find((turno)=> turno.codigo === item.codigo)
    }

    public async add(item: Turno): Promise<Turno | undefined> {
        await turnos.push(item)
        return item
    }

    public async update(item: Turno): Promise<Turno | undefined> {
        const codigoTurnoIndex = await turnos.findIndex((turno) => turno.codigo === item.codigo);

        if(codigoTurnoIndex !== -1){ //no lo encontro
            turnos[codigoTurnoIndex] = {...turnos[codigoTurnoIndex], ...item}
            return turnos[codigoTurnoIndex]
    }return undefined;
    }

    public async delete(item: { codigo: number; }): Promise<Turno | undefined> {
        const codigoTurnoIndex = await turnos.findIndex(turno => turno.codigo === item.codigo)

        if(codigoTurnoIndex !== -1){
            const deletedTurnos = turnos[codigoTurnoIndex]
            turnos.splice(codigoTurnoIndex, 1)
            return deletedTurnos
        }
    }
}