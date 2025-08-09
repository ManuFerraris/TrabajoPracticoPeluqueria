import { Router } from "express";
import { AppError } from '../shared/errors/AppError.js'; //menejo de errores
import { findAll,
    getOne, 
    add,
    update, 
    remove,
    top3Peluqueros,
    getMisTurnos } from "./peluquero.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const peluqueroRouter = Router()

peluqueroRouter.get('/topTresPeluqueros',authMiddleware, authorizeRole(['peluquero', 'admin']), top3Peluqueros);
peluqueroRouter.get('/misTurnos/:codigo_peluquero',authMiddleware, authorizeRole(['peluquero', 'admin']), getMisTurnos);
peluqueroRouter.get('/', authMiddleware, authorizeRole(['peluquero', 'admin']), findAll);
peluqueroRouter.get('/:codigo_peluquero', authMiddleware, authorizeRole(['peluquero', 'admin']), getOne);
peluqueroRouter.post('/', authMiddleware, authorizeRole(['peluquero', 'admin']), add);
peluqueroRouter.put('/:codigo_peluquero',authMiddleware, authorizeRole(['peluquero', 'admin']), update);
peluqueroRouter.delete('/:codigo_peluquero',authMiddleware, authorizeRole(['peluquero', 'admin']), remove);