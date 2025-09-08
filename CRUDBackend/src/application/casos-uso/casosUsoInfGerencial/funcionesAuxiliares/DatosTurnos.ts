import { Turno } from "../../../../turno/turno.entity.js";

export function DatosTurnos(turnos:Turno[]):{cantTurnosAten:number, cantTurnosCancel:number}{
    let cantTurnosAten = 0;
    let cantTurnosCancel = 0;
    for(const turno of turnos){
        if(turno.estado === "Atendido") cantTurnosAten++;
        else if(turno.estado === "Cancelado") cantTurnosCancel++;
    };
    return {cantTurnosAten, cantTurnosCancel};
};