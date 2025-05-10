import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Turno } from "../turno/turno.entity.js";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
import { Servicio } from "../Servicio/servicio.entity.js";

const em = orm.em;

export async function obtenerHistorialCliente(req: Request, res: Response) {
    try {
        const codigo_cliente = Number.parseInt(req.params.codigo_cliente);

        if (isNaN(codigo_cliente)) {
            return res.status(400).json({ message: "Código de cliente inválido" });
        }

        const cliente = await em.findOne(Cliente, { codigo_cliente });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const turnos = await em.find(Turno, { cliente }, {
            populate: ['peluquero', 'servicio', 'cliente']
        });

        res.status(200).json({ message: "Historial del cliente obtenido", data: turnos });
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener el historial", details: error.message });
    }
}
    