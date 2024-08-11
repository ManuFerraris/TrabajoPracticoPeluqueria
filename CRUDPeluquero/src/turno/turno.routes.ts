import { Router } from "express";
import { sanitizeTurnoInput, findAll, getOne, add, update, remove } from "./turno.controler.js";

export const turnoRouter = Router()

turnoRouter.get('/', findAll)
turnoRouter.get('/:codigo', getOne)
turnoRouter.post('/', sanitizeTurnoInput, add)
turnoRouter.put('/:codigo', sanitizeTurnoInput, update)
turnoRouter.patch('/:codigo', sanitizeTurnoInput, update)
turnoRouter.delete('/:codigo', remove)