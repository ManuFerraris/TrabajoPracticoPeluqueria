import { Router } from "express";
import {
    datosLayout,
    resumenPorPeluquero,
    comportamientoClientes
} from "./InformacionGerencial.controller.js";

export const infGerenRouter = Router();

infGerenRouter.post('/', datosLayout);
infGerenRouter.post('/resumenPorPeluquero', resumenPorPeluquero);
infGerenRouter.post('/resumenClientes', comportamientoClientes);