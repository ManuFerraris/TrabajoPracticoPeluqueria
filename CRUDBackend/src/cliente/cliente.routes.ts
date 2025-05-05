import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeClienteInput} from "./cliente.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const clienteRouter = Router()

//clienteRouter.get('/', findAll) <-esta ruta no es segura, no requiere autenticación
clienteRouter.get('/', authMiddleware, authorizeRole('cliente'), findAll) // Ruta protegida solo para CLIENTES
clienteRouter.get('/:codigo_cliente', getOne)
clienteRouter.post('/',sanitizeClienteInput, add)
clienteRouter.put('/:codigo_cliente', authMiddleware, authorizeRole('cliente'), sanitizeClienteInput, update) //Actualizar solo si está autenticado y es cliente
clienteRouter.delete('/:codigo_cliente', remove)
