import { Cliente } from "../../../../cliente/clientes.entity.js";

export function CantidadClientes(clientes: Cliente[], fechaDesde: Date, fechaHasta: Date): {
    cantTotalClientes: number;
    cantClientesNuevos: number;
    }{
    const cantTotalClientes = clientes.length;
    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);

    const cantClientesNuevos = clientes.filter(c => {
        if (!c.fecha_Ingreso) return false;
        const fecha = new Date(c.fecha_Ingreso + "T00:00:00.000Z");
        console.log("Fecha ingreso cliente:", c.fecha_Ingreso, "→", fecha.toISOString());
        return fecha >= desde && fecha <= hasta;
    }).length;

    return { cantTotalClientes, cantClientesNuevos };
};