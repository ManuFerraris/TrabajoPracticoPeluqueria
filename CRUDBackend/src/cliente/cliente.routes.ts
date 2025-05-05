import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeClienteInput} from "./cliente.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";
export const clienteRouter = Router()

//clienteRouter.get('/', findAll) <-esta ruta no es segura, no requiere autenticación
clienteRouter.get('/', authMiddleware, findAll) // Ruta protegida
clienteRouter.get('/:codigo_cliente', getOne)
clienteRouter.post('/',sanitizeClienteInput, add)
clienteRouter.put('/:codigo_cliente',sanitizeClienteInput, update)
clienteRouter.delete('/:codigo_cliente', remove)
