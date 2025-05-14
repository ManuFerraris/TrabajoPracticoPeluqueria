import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizePeluqueroInput } from "./peluquero.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const peluqueroRouter = Router()

peluqueroRouter.get('/', authMiddleware, authorizeRole(['peluquero']), findAll) // Ruta protegida
peluqueroRouter.get('/:codigo_peluquero', authMiddleware, authorizeRole(['peluquero']), getOne) //Aqui si indicamos el codigo para realizar la busqueda.
peluqueroRouter.post('/', authMiddleware, authorizeRole(['peluquero']), sanitizePeluqueroInput, add)
peluqueroRouter.put('/:codigo_peluquero',authMiddleware, authorizeRole(['peluquero']), sanitizePeluqueroInput, update)
peluqueroRouter.delete('/:codigo_peluquero',authMiddleware, authorizeRole(['peluquero']), remove)