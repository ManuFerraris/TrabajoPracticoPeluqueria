import { Router } from "express";
import { sanitizeCostoInput, findAll, getOne, add, update, remove } from "./costo.controler.js";

export const costoRouter = Router()

costoRouter.get('/', findAll)
costoRouter.get('/:codigo', getOne)
costoRouter.post('/', sanitizeCostoInput, add)
costoRouter.put('/:codigo', sanitizeCostoInput, update)
costoRouter.patch('/:codigo', sanitizeCostoInput, update)
costoRouter.delete('/:codigo', remove)