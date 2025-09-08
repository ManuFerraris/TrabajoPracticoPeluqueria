import { Cliente } from "../../../../cliente/clientes.entity.js";

export function EstadosClientes(clientes:Cliente[]):{cantCliActivos: number, cantCliSancionados: number;}{
    let cantCliActivos = 0;
    let cantCliSancionados = 0;

    for (const cliente of clientes) {
        if (cliente.estado === "Activo") cantCliActivos++;
        else if (cliente.estado === "Sancionado") cantCliSancionados++;
    };

    return { cantCliActivos, cantCliSancionados };
};