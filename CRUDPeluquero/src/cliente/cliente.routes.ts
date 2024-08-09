import { Router } from "express";
import { sanitizeClienteInput, findAll, getOne, add, update, remove} from "./cliente.controler.js";

export const clienteRouter = Router()

clienteRouter.get('/', findAll)
clienteRouter.get('/:codigo', getOne)
clienteRouter.post('/', sanitizeClienteInput, add)
clienteRouter.put('/:codigo', sanitizeClienteInput, update)
clienteRouter.patch('/:codigo', sanitizeClienteInput, update)
clienteRouter.delete('/:codigo', remove)