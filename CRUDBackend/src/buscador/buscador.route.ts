import { Router } from "express";
import { findAll } from "./buscador.js";

export const buscadorRouter = Router()

buscadorRouter.get('/:codigo_peluquero', findAll);
