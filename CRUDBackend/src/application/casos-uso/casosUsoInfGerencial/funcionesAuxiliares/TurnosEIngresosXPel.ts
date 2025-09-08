import { Turno } from "../../../../turno/turno.entity.js";

export function TurnosEIngresosXPel(turnos:Turno[]): {nomPel: string, cantTurnos:number, ingNeto:number}[]{
    const EUR_TO_ARS = 1000;
    const COSTO_STRIPE = 0.0325;
    const FIJO_STRIPE_ARS = 0.25 * EUR_TO_ARS;

    const resumen: Record<string, { nomPel: string; cantTurnos: number; ingNeto: number }> = {};

    for (const turno of turnos) {
        const peluquero = turno.peluquero;
        const servicio = turno.servicio;
        if (!peluquero || !servicio) continue;

        const nombre = peluquero.nombre;
        const monto = servicio.total;
        const medio = servicio.medio_pago;

        const descuento = medio === "Stripe" ? monto * COSTO_STRIPE + FIJO_STRIPE_ARS : 0;
        const neto = monto - descuento;

        if (!resumen[nombre]) {
            resumen[nombre] = { nomPel: nombre, cantTurnos: 0, ingNeto: 0 };
        };

        resumen[nombre].cantTurnos += 1;
        resumen[nombre].ingNeto += neto;

        /*if (resumen[nombre].cantTurnos === 1) {
            console.log("Primer turno registrado para:", nombre);
        };*/
    };

    //console.log("Devolviendo resumen: ", resumen);

    return Object.values(resumen).map(r => ({
        ...r,
        ingNeto: Math.round(r.ingNeto)
    }));
};