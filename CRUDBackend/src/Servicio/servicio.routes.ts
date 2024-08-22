import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeServicioInput } from "./servicio.controler.js";

export const servicioRouter = Router()

servicioRouter.get('/', findAll)
servicioRouter.get('/:codigo', getOne)
servicioRouter.post('/', add)
servicioRouter.put('/:codigo', sanitizeServicioInput, update)
servicioRouter.delete('/:codigo', remove)