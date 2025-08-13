import { Router } from "express";
import {
    findAll,
    getOne,
    add, 
    update,
    remove,
    obtenerHistorialCliente,
    signup
} from "./cliente.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const clienteRouter = Router();
clienteRouter.get('/misTurnosCliente/:codigo_cliente', authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']), obtenerHistorialCliente);
clienteRouter.get('/', authMiddleware, authorizeRole(['peluquero', 'cliente']), findAll);
clienteRouter.get('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), getOne);
clienteRouter.post('/', authMiddleware, authorizeRole(['peluquero', 'cliente']), add)
clienteRouter.put('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), update) //Actualizar solo si está autenticado y es cliente
clienteRouter.delete('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), remove)

clienteRouter.post('/signup', signup); // Para el signup!