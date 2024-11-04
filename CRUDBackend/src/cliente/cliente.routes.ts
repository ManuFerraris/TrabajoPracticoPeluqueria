import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeClienteInput} from "./cliente.controler.js";

export const clienteRouter = Router()

clienteRouter.get('/', findAll)
clienteRouter.get('/:codigo_cliente', getOne)
clienteRouter.post('/',sanitizeClienteInput, add)
clienteRouter.put('/:codigo_cliente',sanitizeClienteInput, update)
clienteRouter.delete('/:codigo_cliente', remove)
