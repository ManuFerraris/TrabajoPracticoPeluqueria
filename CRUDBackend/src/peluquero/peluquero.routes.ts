import { Router } from "express";
import { AppError } from '../shared/errors/AppError.js'; //menejo de errores
import { findAll, getOne, add, update, remove, sanitizePeluqueroInput } from "./peluquero.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const peluqueroRouter = Router()

peluqueroRouter.get('/', authMiddleware, authorizeRole(['peluquero', 'admin']), findAll) // Ruta protegida
peluqueroRouter.get('/:codigo_peluquero', authMiddleware, authorizeRole(['peluquero', 'admin']), getOne) //Aqui si indicamos el codigo para realizar la busqueda.
peluqueroRouter.post('/', authMiddleware, authorizeRole(['peluquero', 'admin']), sanitizePeluqueroInput, add)
peluqueroRouter.put('/:codigo_peluquero',authMiddleware, authorizeRole(['peluquero', 'admin']), sanitizePeluqueroInput, update)
peluqueroRouter.delete('/:codigo_peluquero',authMiddleware, authorizeRole(['peluquero', 'admin']), remove)