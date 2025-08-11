import { Router } from "express";
import { obtenerHistorialCliente } from "./historialCliente.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const historialClienteRouter = Router();

historialClienteRouter.get('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero', 'cliente', 'admin']), obtenerHistorialCliente);
