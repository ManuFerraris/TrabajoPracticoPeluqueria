import { Router } from "express";
import { getOne,
    remove,
    ingresosMensuales
    } from "./servicio.controller.js";

export const servicioRouter = Router()

servicioRouter.get('/ingresosMensuales', ingresosMensuales);
//servicioRouter.get('/', findAll)
servicioRouter.get('/:codigo', getOne)
//servicioRouter.post('/', sanitizeServicioInput, add)
//servicioRouter.put('/:codigo', sanitizeServicioInput, update)
servicioRouter.delete('/:codigo', remove)