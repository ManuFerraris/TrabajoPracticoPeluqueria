import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Turno } from "../turno/turno.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";

const em = orm.em;

export async function obtenerHistorialPeluquero(req: Request, res: Response) {
    try {
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero);

        if (isNaN(codigo_peluquero)) {
            return res.status(400).json({ message: "Código de peluquero inválido" });
        }

        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });
        if (!peluquero) {
            return res.status(404).json({ message: "Peluquero no encontrado" });
        }

        const turnos = await em.find(Turno, { peluquero }, {
            populate: ['cliente', 'servicio', 'peluquero']
        });

        res.status(200).json({ message: "Historial del peluquero obtenido", data: turnos });
    } catch (error: any) {
        res.status(500).json({ message: "Error al obtener el historial", details: error.message });
    }
}
