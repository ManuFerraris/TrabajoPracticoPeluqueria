import { Router } from "express";
import { findAll,
    getOne,
    add,
    update,
    remove } from "./localidad.controller.js";

export const localidadRouter = Router();

localidadRouter.get('/', findAll);
localidadRouter.get('/:codigo', getOne);
localidadRouter.post('/', add);
localidadRouter.put('/:codigo', update)
localidadRouter.delete('/:codigo', remove)