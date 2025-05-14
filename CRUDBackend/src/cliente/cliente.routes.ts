import { Router } from "express";
import { findAll, getOne, add, update, remove, sanitizeClienteInput} from "./cliente.controler.js";
import { authMiddleware } from "../auth/auth.middleware.js";
import { authorizeRole } from "../auth/authorizeRole.js";

export const clienteRouter = Router()

clienteRouter.get('/', authMiddleware, authorizeRole(['peluquero', 'cliente']), findAll)
/*clienteRouter.get(
    '/',
    (req, res, next) => { console.log("Paso 1"); next(); },
    authMiddleware,
    (req, res, next) => { console.log("Paso 2"); next(); },
    authorizeRole(['peluquero', 'cliente']),
    (req, res, next) => { console.log("Paso 3"); next(); },
    findAll
);*/
clienteRouter.get('/:codigo_cliente',authMiddleware, authorizeRole(['peluquero']), getOne)
clienteRouter.post('/',authMiddleware, authorizeRole(['peluquero']), sanitizeClienteInput, add)
clienteRouter.put('/:codigo_cliente', authMiddleware, authorizeRole(['peluquero']), sanitizeClienteInput, update) //Actualizar solo si está autenticado y es cliente
clienteRouter.delete('/:codigo_cliente',authMiddleware, authorizeRole(['peluquero']), remove)
