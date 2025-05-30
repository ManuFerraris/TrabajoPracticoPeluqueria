import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeClienteInput } from "./cliente.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const clienteRouter = Router();

// Ruta GET /: Todos los clientes (accesible por peluqueros y clientes)
clienteRouter.get('/', authMiddleware, authorizeRole(['peluquero', 'cliente']), findAll);

// Ruta GET /:codigo_cliente: Detalle de cliente (solo peluqueros)
clienteRouter.get('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), getOne);

// Ruta POST /: Crear cliente (solo peluqueros)
clienteRouter.post('/', authMiddleware, authorizeRole(['peluquero']), sanitizeClienteInput, add);

// Ruta PUT /:codigo_cliente: Actualizar cliente (solo peluqueros)
clienteRouter.put('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), sanitizeClienteInput, update);

// Ruta DELETE /:codigo_cliente: Eliminar cliente (solo peluqueros)
clienteRouter.delete('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), remove);