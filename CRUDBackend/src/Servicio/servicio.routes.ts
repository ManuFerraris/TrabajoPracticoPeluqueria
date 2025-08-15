import { Router } from "express";
import { findAll,
    getOne,
    add,
    update,
    remove,
    ingresosMensuales,
    verMiTurno
    } from "./servicio.controller.js";

export const servicioRouter = Router()

servicioRouter.get('/buscarMiTurno/:codigo', verMiTurno);
servicioRouter.get('/ingresosMensuales', ingresosMensuales);
servicioRouter.get('/', findAll);
servicioRouter.get('/:codigo', getOne);
servicioRouter.post('/', add);
servicioRouter.put('/:codigo', update);
servicioRouter.delete('/:codigo', remove);