import { Router } from "express";
import { findAll, getOne, add, update, remove } from "./servicio.controler.js";

export const costoRouter = Router()

costoRouter.get('/', findAll)
costoRouter.get('/:codigo', getOne)
costoRouter.post('/', add)
costoRouter.put('/:codigo', update)
costoRouter.patch('/:codigo', update)
costoRouter.delete('/:codigo', remove)