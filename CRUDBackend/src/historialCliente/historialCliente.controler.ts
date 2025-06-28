import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Turno } from "../turno/turno.entity.js";
import { Cliente } from "../cliente/clientes.entity.js";

const em = orm.em;

export async function obtenerHistorialCliente(req: Request, res: Response) {
    try {
        const codigo_cliente_param = Number.parseInt(req.params.codigo_cliente);
        
        // Forma correcta de acceder a los datos del usuario
        const loggedInUserId = req.user.codigo;
        const userRole = req.user.rol;

        if (isNaN(codigo_cliente_param)) {
            return res.status(400).json({ message: "Código de cliente inválido en parámetro." });
        }

        // Verificación de seguridad
        let targetClienteId = codigo_cliente_param;
        if (userRole === 'cliente' && codigo_cliente_param !== loggedInUserId) {
            return res.status(403).json({ message: "No autorizado para ver este historial." });
        }

        const cliente = await em.findOne(Cliente, { codigo_cliente: targetClienteId });
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado." });
        };

        const turnos = await em.find(Turno, { cliente }, {
            populate: ['peluquero', 'servicio', 'cliente']
        });

        return res.status(200).json({ message: "Historial del cliente obtenido", data: turnos });
    
    } catch (error: any) {
        return res.status(500).json({ message: "Error al obtener el historial del cliente.", details: error.message });
    };
};