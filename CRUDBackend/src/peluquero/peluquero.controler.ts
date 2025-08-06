import { Request, Response, NextFunction } from "express"
import { Peluquero } from "./peluqueros.entity.js"
import { Turno } from "../turno/turno.entity.js"
import bcrypt from "bcryptjs"
import { MikroORM } from "@mikro-orm/core"

import { validarCodigo } from "../application/validarCodigo.js";
import { PeluqueroRepositoryORM } from "../shared/db/PeluqueroRepositoryORM.js";
import { FindAll } from "../application/casos-uso/casosUsoPeluquero/ListarPeluqueros.js";
import { BuscarPeluquero } from "../application/casos-uso/casosUsoPeluquero/BuscarPeluquero.js";
import { RegistrarPeluquero } from "../application/casos-uso/casosUsoPeluquero/RegistrarPeluquero.js"
import { ActualizarPeluquero } from "../application/casos-uso/casosUsoPeluquero/ActualizarPeluquero.js"
import { EliminarPeluquero } from "../application/casos-uso/casosUsoPeluquero/EliminarPeluquero.js"

export const findAll = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new FindAll(repo);

        const peluqueros = await casouso.ejecutar();
        if(peluqueros.length === 0){
            res.status(404).json({ message: "Peluquero no encontrado." })
        };

        res.status(201).json({ data: peluqueros });
        return;
    }catch(errores:any){
        console.error('Error al traer los peluqueros: ', errores);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    };
};

export const getOne = async (req:Request, res:Response):Promise<void> => {
    try{
        const errorCodigo = validarCodigo(req.params.codigo_peluquero, 'codigo de peluquero');
        if(errorCodigo){
            res.status(400).json({ message: errorCodigo });
            return;
        };

        const codigoPel = Number(req.params.codigo_peluquero);

        const orm = (req.app.locals as { orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new BuscarPeluquero(repo);

        const peluquero = await casouso.ejecutar(codigoPel);
        if(!peluquero){
            res.status(404).json({ message: 'No se encontro el peluquero.' });
            return;
        };

        res.status(200).json({ message: 'Peluquero encontrado', data: peluquero });
        return;
    }catch(errores){
        console.error('Error al buscar el peluquero: ', errores);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    };
};

export const add = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new RegistrarPeluquero(repo);

        const dto = req.body;
        const resultado = await casouso.ejecutar(dto, em);

        if(Array.isArray(resultado)){
            res.status(400).json({ message: resultado[0] })
            return;
        };

        res.status(201).json({
            message: 'Peluquero creado', 
            data: {
                ...resultado,
                password: undefined // No devolvemos el hash en la respuesta!!!!!!!
            }
        });
        return;

    }catch(errores:any){
        console.error('Error al crear el peluquero: ', errores);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    };
};

export const update = async (req:Request, res:Response):Promise<void> => {
    try{
        const errorCodigo = validarCodigo(req.params.codigo_peluquero, 'codigo de peluquero');
        if(errorCodigo){
            res.status(400).json({ message: errorCodigo });
            return;
        };

        const codigoPel = Number(req.params.codigo_peluquero);

        const orm = (req.app.locals as { orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new ActualizarPeluquero(repo);

        const dto = req.body;
        const actualizacion = true;
        const peluqueroActualizado = await casouso.ejecutar(codigoPel, dto, em, actualizacion);

        if(Array.isArray(peluqueroActualizado)){
            res.status(400).json({ message: peluqueroActualizado[0] })
            return;
        };

        res.status(201).json({
            message: 'Peluquero actualizado', 
            data: {
                ...peluqueroActualizado,
                password: undefined // No devolvemos el hash en la respuesta!!!!!!!
            }
        });
        return;
    }catch(errores:any){
        console.error('Error al actualizar al peluquero ', errores);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    }
};

/*
async function remove(req: Request, res: Response){
    try{
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero)
        if(isNaN(codigo_peluquero)){
            return res.status(400).json({ message: 'Código de peluquero inválido' });
        }
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });
        if(!peluquero){
            return res.status(404).json({ message: 'Peluquero no encontrado' })
        } 
        const turnos = await em.find(Turno, { peluquero });
        if (turnos.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar el peluquero porque tiene turnos asignados' });
        }
        await em.removeAndFlush(peluquero)
        return res.status(200).json({message: 'Peluquero borrado Exitosamente'})
    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
};
*/

export const remove = async (req:Request, res:Response):Promise<void> => {
    try{
        const errorCodigo = validarCodigo(req.params.codigo_peluquero, 'codigo de peluquero');
        if(errorCodigo){
            res.status(400).json({ message: errorCodigo });
            return;
        };

        const codigoPel = Number(req.params.codigo_peluquero);

        const orm = (req.app.locals as { orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new EliminarPeluquero(repo);

        const errores = await casouso.ejecutar(codigoPel);

        if (errores.length > 0){
            res.status(404).json({ message: errores[0] });
            return;
        };

        res.status(200).json({ message: 'Peluquero eliminado exitosamente' })
        return;

    }catch(errores:any){
        console.error('Error al eliminar al peluquero ', errores);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    };
};