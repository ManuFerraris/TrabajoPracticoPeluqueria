import { Router } from "express";
import { sanitizeProductoInput, findAll, getOne, add, update, remove } from "./producto.controler.js";

export const productoRouter = Router()

productoRouter.get('/', findAll)
productoRouter.get('/:codigo', getOne)
productoRouter.post('/', sanitizeProductoInput, add)
productoRouter.put('/:codigo', sanitizeProductoInput, update)
productoRouter.patch('/:codigo', sanitizeProductoInput, update)
productoRouter.delete('/:codigo', remove)