import { Router } from "express";
//import { findAll, getOne, add, update, remove, sanitizeTurnoInput} from "./turno.controler.js";
import { listarTurnosFiltrados,
    listarTurnosCanceladosPorMes,
    findAll,
    getOne,
    add,
    update,
    remove,
    } from "./turno.controller.js";

export const turnoRouter = Router();

turnoRouter.get('/filtrados', listarTurnosFiltrados); //Express evalua el orden de las rutas.
turnoRouter.get('/filtroCancelados', listarTurnosCanceladosPorMes);
turnoRouter.get('/', findAll);
turnoRouter.get('/:codigo_turno', getOne);
turnoRouter.delete('/:codigo_turno', remove);
turnoRouter.post('/', add);
turnoRouter.put('/:codigo_turno', update)

