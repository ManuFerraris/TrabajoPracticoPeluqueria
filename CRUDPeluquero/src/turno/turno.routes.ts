import { Router } from "express";
import { findAll, getOne, add, update, remove } from "./turno.controler.js";

export const turnoRouter = Router()

turnoRouter.get('/', findAll)
turnoRouter.get('/:codigo_turno', getOne)
turnoRouter.post('/', add)
turnoRouter.put('/:codigo_turno', update)
turnoRouter.delete('/:codigo_turno', remove)