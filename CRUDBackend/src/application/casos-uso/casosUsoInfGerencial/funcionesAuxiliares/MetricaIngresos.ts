import { Turno } from "../../../../turno/turno.entity.js";

export function MetricaIngresos(turnos:Turno[]):{ingNeto:number, ingBruto:number, promIngPorTurno:number}{
    const EUR_TO_ARS = 1000;
    const COSTO_STRIPE = 0.0325;
    const FIJO_STRIPE_ARS = 0.25 * EUR_TO_ARS;

    let ingBruto = 0;
    let ingNeto = 0;

    for (const turno of turnos) {
        const servicio = turno.servicio;
        if (!servicio || typeof servicio.total !== "number") continue;

        const total = servicio.total;
        ingBruto += total;

        if (servicio.medio_pago === "Stripe") {
            const costoStripe = total * COSTO_STRIPE + FIJO_STRIPE_ARS;
            ingNeto += total - costoStripe;
        } else {
            ingNeto += total;
        };
    };

    const promIngPorTurno = turnos.length > 0 ? ingNeto / turnos.length : 0;

    return {
        ingNeto: Math.round(ingNeto),
        ingBruto: Math.round(ingBruto),
        promIngPorTurno: Math.round(promIngPorTurno)
    };
};