import { Router } from "express";
import { sanitizePeluqueroInput, findAll, getOne, add, update, remove } from "./peluquero.controler.js";

export const peluqueroRouter = Router()

peluqueroRouter.get('/', findAll) //Usamos la raiz, no la ruta completa e indicamos los handlers.
peluqueroRouter.get('/:codigo', getOne) //Aqui si indicamos el codigo para realizar la busqueda.
peluqueroRouter.post('/', sanitizePeluqueroInput, add)
peluqueroRouter.put('/:codigo', sanitizePeluqueroInput, update)
peluqueroRouter.patch('/:codigo', sanitizePeluqueroInput, update)
peluqueroRouter.delete('/:codigo', remove)
