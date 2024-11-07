import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeTipoServicioInput } from "./TipoServicio.controler.js";

export const tipoServicioRouter = Router();

tipoServicioRouter.get("/", findAll);
tipoServicioRouter.get("/:codigo_tipo", getOne);
tipoServicioRouter.post("/",sanitizeTipoServicioInput, add);
tipoServicioRouter.put("/:codigo_tipo",sanitizeTipoServicioInput, update);
tipoServicioRouter.delete("/:codigo_tipo", remove);