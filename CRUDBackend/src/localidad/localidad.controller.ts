import { Request, Response, NextFunction } from "express";
import { MikroORM } from "@mikro-orm/mysql";
import { LocalidadRepositoryORM } from "../shared/db/LocalidadRepositoryORM.js";
import { ListarLocalidades } from "../application/casos-uso/casosUsoLocalidad/ListarLocalidades.js";
import { validarCodigo } from "../application/validarCodigo.js";
import { BuscarLocalidad } from "../application/casos-uso/casosUsoLocalidad/ObtenerLocalidad.js";
import { RegistrarLocalidad } from "../application/casos-uso/casosUsoLocalidad/RegistrarLocalidad.js";
import { ActualizarLocalidad } from "../application/casos-uso/casosUsoLocalidad/ActualizarLocalidad.js";
import { EliminarLocalidad } from "../application/casos-uso/casosUsoLocalidad/EliminarLocalidad.js";

export const findAll = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as {orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new LocalidadRepositoryORM(em);
        const casouso = new ListarLocalidades(repo);

        const localidades = await casouso.ejecutar();

        if(localidades.length === 0){
            res.status(404).json({ message: 'No hay localidades cargadas'});
            return;
        };

        res.status(201).json({ data: localidades });
        return;

    }catch(errores:any){
        console.error('Error al traer las localidades ', errores);
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const getOne = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codLoc, error: errorCodigo} = validarCodigo(req.params.codigo, 'codigo localidad');
        if(errorCodigo || codLoc === undefined){
            res.status(404).json({message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new LocalidadRepositoryORM(em);
        const casouso = new BuscarLocalidad(repo);

        const localidad = await casouso.ejecutar(codLoc);

        if(!localidad){
            res.status(404).json({ message: `Localidad con codigo ${codLoc} no encontrada` });
            return;
        };

        res.status(200).json({ message: 'Localidad encontrada', data: localidad });
        return;
    }catch(errores:any){
        console.error( "Error al traer la localidad", errores );
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const add = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new LocalidadRepositoryORM(em);
        const casouso = new RegistrarLocalidad(repo);

        const dto = req.body;

        const resultado = await casouso.ejecutar(dto, em);

        if(Array.isArray(resultado)){
            res.status(400).json({ errores: resultado });
            return;
        };

        res.status(201).json({ message: 'Localidad creada con exito', resultado });
        return;

    }catch(errores:any){
        console.error('Error al crear la localidad', errores);
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const update = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codVal, error: codError} = validarCodigo(req.params.codigo, 'codigo localidad');
        if(codError || codVal === undefined){
            res.status(404).json({errores: codError});
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new LocalidadRepositoryORM(em);
        const casouso = new ActualizarLocalidad(repo);

        const dto = req.body;
        const actualizar = true;
        const {errores, localidadActualizada} = await casouso.ejecutar(dto, codVal, em, actualizar);

        if(errores.length > 0){
            res.status(404).json({ message: errores[0] });
            return;
        };
        res.status(201).json({ message: 'Localidad Actualizada', data: localidadActualizada});
        return;

    }catch(errores:any){
        console.error('Error al actualizar una localidad', errores);
        res.status(500).json({ message: 'Error interno del servidor.' });
        return;
    };
};

export const remove = async(req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codVal, error: codError} = validarCodigo(req.params.codigo, 'codigo localidad');
        if(codError || codVal === undefined){
            res.status(404).json({ errores: codError });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new LocalidadRepositoryORM(em);
        const casouso = new EliminarLocalidad(repo);

        const errores = await casouso.ejecutar(codVal);

        if(errores.length > 0){
            res.status(404).json({ message: errores[0] });
            return;
        };

        res.status(200).json({ message: 'Localidad eliminada'});
        return;

    }catch(errores:any){
        console.error('Error al eliminar la localidad', errores);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};