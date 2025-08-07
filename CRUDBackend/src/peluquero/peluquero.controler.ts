import { Request, Response, NextFunction } from "express";
import { MikroORM } from "@mikro-orm/core";
import { validarCodigo } from "../application/validarCodigo.js";
import { PeluqueroRepositoryORM } from "../shared/db/PeluqueroRepositoryORM.js";
import { FindAll } from "../application/casos-uso/casosUsoPeluquero/ListarPeluqueros.js";
import { BuscarPeluquero } from "../application/casos-uso/casosUsoPeluquero/BuscarPeluquero.js";
import { RegistrarPeluquero } from "../application/casos-uso/casosUsoPeluquero/RegistrarPeluquero.js";
import { ActualizarPeluquero } from "../application/casos-uso/casosUsoPeluquero/ActualizarPeluquero.js";
import { EliminarPeluquero } from "../application/casos-uso/casosUsoPeluquero/EliminarPeluquero.js";
import { PeluqueroConMasClientes } from "../application/casos-uso/casosUsoPeluquero/PeluqueroConMasClientes.js";
import { GetMisTurnos } from "../application/casos-uso/casosUsoPeluquero/GetMisTurnos.js";

export const findAll = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new FindAll(repo);

        const peluqueros = await casouso.ejecutar();
        if(peluqueros.length === 0){
            res.status(404).json({ message: "Peluquero no encontrado." })
            return;
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
        const codPel = req.params.codigo_peluquero;
        const { valor: codigoPel, error: errorCodigo } = validarCodigo(codPel, 'codigo de peluquero');
        if(errorCodigo || codigoPel === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

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
        const codPel = req.params.codigo_peluquero;
        const { valor: codigoPel, error: errorCodigo } = validarCodigo(codPel, 'codigo de peluquero');
        if(errorCodigo || codigoPel === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

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

export const remove = async (req:Request, res:Response):Promise<void> => {
    try{
        const codPel = req.params.codigo_peluquero;
        const { valor: codigoPel, error: errorCodigo } = validarCodigo(codPel, 'codigo de peluquero');
        if(errorCodigo || codigoPel === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };
        
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

export const top3Peluqueros = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new PeluqueroConMasClientes(repo);

        const peluqueros = await casouso.ejecutar();
        if(peluqueros.length === 0){
            res.status(404).json({ message: "Peluquero no encontrado." })
            return;
        };

        res.status(200).json({ message: 'Top 3 de peluqueros con mas clientes: ', data:peluqueros});
        return;

    }catch(errores:any){
        console.error('Error al eliminar al peluquero ', errores);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    }
};

export const getMisTurnos = async (req:Request, res:Response):Promise<void> => {
    try{
        const { valor: codigo_peluquero, error: error} = validarCodigo(req.params.codigo_peluquero, 'codigo de peluquero');
        if(error || codigo_peluquero === undefined){
            res.status(404).json({ message: error ?? 'codigo invalido'});
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new GetMisTurnos(repo);

        const resultado = await casouso.ejecutar(codigo_peluquero);

        if(typeof resultado === 'string'){
            res.status(404).json({ message: resultado });
            return;
        };
        if(resultado.length === 0){
            res.status(204).json({ message: 'No posee turnos asignados' });
            return;
        };

        res.status(200).json({ turnos: resultado });
        return;

    }catch(errores:any){
        console.error('Error al eliminar al peluquero ', errores);
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};