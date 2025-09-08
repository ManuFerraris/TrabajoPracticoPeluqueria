import { MikroORM } from "@mikro-orm/core";
import { Request, Response } from "express"
import { TurnoRepositoryORM } from "../shared/db/TurnoRepositoryORM.js";
import { ClienteRepositoryORM } from "../shared/db/ClienteRepositoryORM.js";
import { DatosLayout } from "../application/casos-uso/casosUsoInfGerencial/DatosLayout.js";
import { validarFechas } from "./funciones/validarFechas.js";
import { PeluqueroRepositoryORM } from "../shared/db/PeluqueroRepositoryORM.js";
import { ResumenPorPeluquero } from "../application/casos-uso/casosUsoInfGerencial/ResumenPorPeluquero.js";
import { ComportamientoClientes } from "../application/casos-uso/casosUsoInfGerencial/ComportamientoClientes.js";

export const datosLayout = async (req:Request, res:Response):Promise<void> => {
    try{
        const {fechaDesde, fechaHasta} = req.body;
        const validacion = validarFechas(fechaDesde, fechaHasta);
        if (!validacion.valido) {
            res.status(400).json({ message: validacion.mensaje });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repoTurno = new TurnoRepositoryORM(em);
        const repoCli = new ClienteRepositoryORM(em);
        const casouso = new DatosLayout(repoTurno, repoCli);

        const resul = await casouso.ejecutar(fechaDesde, fechaHasta);

        res.status(resul.estado).json({ message: resul.mensaje, data: resul.datos });
        return;
    }catch(error: any){
        console.error("Error al obtener las metricas entre el rango de fechas", error);
        res.status(500).json({ message: "Error interno del servidor" });
        return;
    };
};

export const resumenPorPeluquero = async (req:Request, res:Response):Promise<void> => {
    try{
        const {fechaDesde, fechaHasta} = req.body;
        const validacion = validarFechas(fechaDesde, fechaHasta);
        if (!validacion.valido) {
            res.status(400).json({ message: validacion.mensaje });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repoTurno = new TurnoRepositoryORM(em);
        const repoPel = new PeluqueroRepositoryORM(em);
        const casouso = new ResumenPorPeluquero(repoTurno, repoPel);

        const resul = await casouso.ejecutar(fechaDesde, fechaHasta);
        res.status(resul.estado).json({ message: resul.mensaje, data: resul.datos });
        return;
        
    }catch(error:any){
        console.error("Error al obtener los resultados de los peluqueros.", error);
        res.status(500).json({ message: "Error interno del servidor" });
        return;
    };
};

export const comportamientoClientes = async (req:Request, res:Response):Promise<void> => {
    try{
        const {fechaDesde, fechaHasta} = req.body;
        const validacion = validarFechas(fechaDesde, fechaHasta);
        if (!validacion.valido) {
            res.status(400).json({ message: validacion.mensaje });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repoTurno = new TurnoRepositoryORM(em);
        const repoCli = new ClienteRepositoryORM(em);
        const casouso = new ComportamientoClientes(repoCli, repoTurno);

        const resul = await casouso.ejecutar(fechaDesde, fechaHasta);
        res.status(resul.estado).json({ message: resul.mensaje, data: resul.datos });
        return;

    }catch(error:any){
        console.error("Error al obtener los resultados de los clientes.", error);
        res.status(500).json({ message: "Error interno del servidor" });
        return;
    };
};