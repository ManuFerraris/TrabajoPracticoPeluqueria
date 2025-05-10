import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeTurnoInput} from "./turno.controler.js";

export const turnoRouter = Router()

turnoRouter.get('/', findAll)
turnoRouter.get('/:codigo_turno', getOne)
turnoRouter.post('/',sanitizeTurnoInput, add)
turnoRouter.put('/:codigo_turno',sanitizeTurnoInput, update)
turnoRouter.delete('/:codigo_turno', remove)