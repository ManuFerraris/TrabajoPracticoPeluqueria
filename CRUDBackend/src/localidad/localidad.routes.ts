import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeLocalidadInput} from "./localidad.controler.js";

export const localidadRouter = Router()

localidadRouter.get('/', findAll)
localidadRouter.get('/:codigo', getOne)
localidadRouter.post('/', sanitizeLocalidadInput, add)
localidadRouter.put('/:codigo', sanitizeLocalidadInput, update)
localidadRouter.delete('/:codigo', remove)