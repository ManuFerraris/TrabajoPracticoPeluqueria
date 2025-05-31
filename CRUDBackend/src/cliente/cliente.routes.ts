import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeClienteInput} from "./cliente.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const clienteRouter = Router()

clienteRouter.get('/', authMiddleware, authorizeRole(['peluquero', 'cliente']), findAll)
clienteRouter.get('/:codigo_cliente',authMiddleware, authorizeRole(['peluquero']), getOne)
clienteRouter.post('/',authMiddleware, authorizeRole(['peluquero', 'cliente']), sanitizeClienteInput, add)
clienteRouter.put('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), sanitizeClienteInput, update) //Actualizar solo si está autenticado y es cliente
clienteRouter.delete('/:codigo_cliente',authMiddleware, authorizeRole(['peluquero']), remove)

clienteRouter.post('/signup', sanitizeClienteInput, add); // Para el signup!