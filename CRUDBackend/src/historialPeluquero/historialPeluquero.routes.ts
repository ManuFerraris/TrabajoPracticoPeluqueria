import { Router } from "express";
import { obtenerHistorialPeluquero } from "./historialPeluquero.controler.js";

export const historialPeluqueroRouter = Router();

historialPeluqueroRouter.get('/:codigo_peluquero', obtenerHistorialPeluquero);
