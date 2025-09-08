import { Cliente } from "../../../../cliente/clientes.entity.js";
import { Turno } from "../../../../turno/turno.entity.js";

export function CantClientesCancel(clientes: Cliente[], turnos: Turno[]): {
    nombre: string;
    cantCancel: number;
    } {
    const cancelaciones: Record<number, number> = {};

    for (const turno of turnos) {
        if (turno.estado !== "Cancelado") continue;
        const id = turno.cliente?.codigo_cliente;
        if (!id) continue;

        cancelaciones[id] = (cancelaciones[id] || 0) + 1;
    };

    let maxId = null;
    let maxCancel = 0;

    for (const [idStr, cant] of Object.entries(cancelaciones)) {
        const id = parseInt(idStr);
        if (cant > maxCancel) {
            maxCancel = cant;
            maxId = id;
        };
    };

    const cliente = clientes.find(c => c.codigo_cliente === maxId);
    const nombre = cliente?.NomyApe || "Desconocido"; // para no devolver undefined si es que no existe por algun x motivo.

    return { nombre, cantCancel: maxCancel };
};