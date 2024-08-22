import { Router } from "express";
import { findAll, getOne, add, update, remove } from "./TipoServicio.controler.js";

export const tipoServicioRouter = Router();

tipoServicioRouter.get("/", findAll);
tipoServicioRouter.get("/:codigo_tipo", getOne);
tipoServicioRouter.post("/", add);
tipoServicioRouter.put("/:codigo_tipo", update);
tipoServicioRouter.delete("/:codigo_tipo", remove);
