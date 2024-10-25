import { Router } from "express";
import { sanitizeServicioInput, findAll, getOne, add, update, remove  } from "./servicio.controler.js";

export const servicioRouter = Router()

servicioRouter.get('/', findAll)
servicioRouter.get('/:codigo', getOne)
servicioRouter.post('/', sanitizeServicioInput, add)
servicioRouter.put('/:codigo', sanitizeServicioInput, update)
servicioRouter.delete('/:codigo', remove)