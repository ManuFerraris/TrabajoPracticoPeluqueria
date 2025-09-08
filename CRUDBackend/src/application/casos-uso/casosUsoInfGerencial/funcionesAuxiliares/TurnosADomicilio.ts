import { Turno } from "../../../../turno/turno.entity.js";

export function TurnosADomicilio(turnos: Turno[]): { cantTurnosADom: number, porcTotal: number } {
    const total = turnos.length;
    //console.log("Cantidad total de turnos: ", total);
    const cantTurnosADom = turnos.filter(t => t.servicio?.adicional_adom !== 0).length;
    //console.log("Cantidad de turnos a domicilio: ", cantTurnosADom);
    const porcTotal = total > 0 ? Math.round((cantTurnosADom / total) * 100) : 0;
    //console.log("Porcentaje total: ", porcTotal);

    return { cantTurnosADom, porcTotal };
};