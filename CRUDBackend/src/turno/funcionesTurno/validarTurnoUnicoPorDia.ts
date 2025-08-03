import { EntityManager } from "@mikro-orm/mysql";
import { Cliente } from "../../cliente/clientes.entity.js";
import { Turno } from "../turno.entity.js";

export async function validarTurnoUnicoPorDia(
    em: EntityManager,
    clienteId: number, 
    fechaHora: Date,
    actualizacion: boolean = false ):Promise<string | null> {

    const cliente = await em.findOne(Cliente, { codigo_cliente: clienteId });
    if (!cliente) {
        return 'Cliente no encontrado';
    };

    const fechaTurno = new Date(fechaHora);

    const inicioDelDia = new Date(fechaTurno);
    inicioDelDia.setHours(0, 0, 0, 0);

    const finDelDia = new Date(fechaTurno);
    finDelDia.setHours(23, 59, 59, 999);

    const turnosDelCliente = await em.find(Turno,
        {
            cliente: cliente,
            fecha_hora: { $gte: inicioDelDia, $lte: finDelDia }
        });

    if (actualizacion && turnosDelCliente.length === 1) {
        // Permitimos actualizar si ya tiene un turno ese día
        return null;
    }
    return turnosDelCliente.length > 0 
        ? "El cliente ya tiene un turno registrado en ese día." : null;
};