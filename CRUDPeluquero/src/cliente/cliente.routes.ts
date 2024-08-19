import { Router } from "express";
import { findAll, getOne, add, update, remove} from "./cliente.controler.js";

export const clienteRouter = Router()

clienteRouter.get('/', findAll)
clienteRouter.get('/:codigo_cliente', getOne)
clienteRouter.post('/', add)
clienteRouter.put('/:codigo_cliente', update)
clienteRouter.delete('/:codigo_cliente', remove)