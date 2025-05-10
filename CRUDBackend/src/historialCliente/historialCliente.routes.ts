import { Router } from "express";
import { obtenerHistorialCliente } from "./historialCliente.controler.js";

export const historialClienteRouter = Router();

historialClienteRouter.get('/:codigo_cliente', obtenerHistorialCliente);
