import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Turno } from "../turno/turno.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";

const em = orm.em;

export async function obtenerHistorialPeluquero(req: Request, res: Response) {
    try {
        console.log("Codigo ingresado: ", req.params.codigo_peluquero)
        const codigo_peluquero_param = Number.parseInt(req.params.codigo_peluquero);
        
        // Forma correcta de acceder a los datos del usuario
        const loggedInUserId = req.user.codigo;
        const userRole = req.user.rol;

        if (isNaN(codigo_peluquero_param)) {
            return res.status(400).json({ message: "Código de peluquero inválido en parámetro." });
        }
        
        // Verificación de seguridad
        let targetPeluqueroId = codigo_peluquero_param;
        if (userRole === 'peluquero' && codigo_peluquero_param !== loggedInUserId) {
            return res.status(403).json({ message: "No autorizado para ver este historial." });
        }

        const peluquero = await em.findOne(Peluquero, { codigo_peluquero: targetPeluqueroId });
        if (!peluquero) {
            return res.status(404).json({ message: "Peluquero no encontrado." });
        };

        const turnos = await em.find(Turno, { peluquero }, {
            populate: ['cliente', 'servicio', 'peluquero', 'pago']
        });

        return res.status(200).json({ message: "Historial del peluquero obtenido", data: turnos });
    } catch (error: any) {
        return res.status(500).json({ message: "Error al obtener el historial", details: error.message });
    };
};