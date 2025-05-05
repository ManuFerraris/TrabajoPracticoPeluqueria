import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizePeluqueroInput } from "./peluquero.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
export const peluqueroRouter = Router()

//peluqueroRouter.get('/', findAll) <-esta ruta no es segura, no requiere autenticación
peluqueroRouter.get('/', authMiddleware, findAll) // Ruta protegida
peluqueroRouter.get('/:codigo_peluquero', getOne) //Aqui si indicamos el codigo para realizar la busqueda.
peluqueroRouter.post('/', sanitizePeluqueroInput, add)
peluqueroRouter.put('/:codigo_peluquero',sanitizePeluqueroInput, update)
peluqueroRouter.delete('/:codigo_peluquero', remove)
