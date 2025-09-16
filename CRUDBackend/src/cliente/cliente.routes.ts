import { Router } from "express";
import {
    findAll,
    getOne,
    add, 
    update,
    remove,
    obtenerHistorialCliente,
    signup,
    misTurnosActivos,
    misTurnosAPagar
} from "./cliente.controller.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const clienteRouter = Router();
clienteRouter.get('/misTurnosAPagar/:codigo_cliente', misTurnosAPagar);
clienteRouter.get('/misTurnosActivos/:codigo_cliente', /*authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']),*/ misTurnosActivos);
clienteRouter.get('/misTurnosCliente/:codigo_cliente', authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']), obtenerHistorialCliente);
clienteRouter.get('/', authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']), findAll);
clienteRouter.get('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']), getOne);
clienteRouter.post('/', authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']), add)
clienteRouter.put('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']), update) //Actualizar solo si está autenticado
clienteRouter.delete('/:codigo_cliente', authMiddleware, authorizeRole(['admin']), remove)

clienteRouter.post('/signup', signup); // Para el signup!