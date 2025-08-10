import { Router } from "express";
import { obtenerHistorialPeluquero } from "./historialPeluquero.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const historialPeluqueroRouter = Router();

historialPeluqueroRouter.get('/:codigo_peluquero', /*authMiddleware, authorizeRole(['peluquero']),*/ obtenerHistorialPeluquero);
