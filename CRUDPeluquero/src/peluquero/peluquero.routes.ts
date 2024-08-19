import { Router } from "express";
import { findAll, getOne, add, update, remove } from "./peluquero.controler.js";

export const peluqueroRouter = Router()

peluqueroRouter.get('/', findAll) //Usamos la raiz, no la ruta completa e indicamos los handlers.
peluqueroRouter.get('/:codigo_peluquero', getOne) //Aqui si indicamos el codigo para realizar la busqueda.
peluqueroRouter.post('/', add)
peluqueroRouter.put('/:codigo_peluquero', update)
peluqueroRouter.delete('/:codigo_peluquero', remove)
