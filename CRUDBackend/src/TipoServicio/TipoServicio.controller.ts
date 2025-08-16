import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/mysql";
import { TipoServicioRepositoryORM } from "../shared/db/TipoServicioRepositoryORM.js";
import { TraerTiposServicios } from "../application/casos-uso/casosUsoTipoServicio/GetAllTiposServicios.js";
import { validarCodigo } from "../application/validarCodigo.js";
import { TraerTipoServicio } from "../application/casos-uso/casosUsoTipoServicio/ObtenerTipoServicio.js";
import { EliminarTipoServicio } from "../application/casos-uso/casosUsoTipoServicio/EliminarTipoServicio.js";
import { RegistrarTipoServicio } from "../application/casos-uso/casosUsoTipoServicio/RegistrarTipoServicio.js";
import { ActualizarTipoServicio } from "../application/casos-uso/casosUsoTipoServicio/ActualizarTipoServicio.js";
import { ObtenerMisServicios } from "../application/casos-uso/casosUsoTipoServicio/ObtenerMisServicios.js";

export const findAll = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TipoServicioRepositoryORM(em);
        const casouso = new TraerTiposServicios(repo);

        const tipoServicios = await casouso.ejecutar();
        if(tipoServicios.length === 0){
            res.status(400).json({ message: 'No se encontraron tipos de servicios.' });
            return;
        };

        res.status(200).json({ message: 'Tipos de servicio encontrados.', data: tipoServicios });
        return;

    }catch(errores:any){
        console.error( 'Error al traer los tipos de servicios.', errores );
        res.status(500).json({ message:'Error interno del servidor.' });
        return;
    };
};

export const getOne = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codVal, error: codError} = validarCodigo(req.params.codigo_tipo, 'codigo tipo servicio');
        if(codError || codVal === undefined){
            res.status(400).json({ errores: codError });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TipoServicioRepositoryORM(em);
        const casouso = new TraerTipoServicio(repo);

        const tipoServicio = await casouso.ejecutar(codVal);
        if(!tipoServicio){
            res.status(400).json({ message: `No se encontro el tipo de servicio con codigo ${codVal}.` });
            return;
        };

        res.status(200).json({ message: 'Tipo de servicio encontrado.', data: tipoServicio });
        return;

    }catch(errores:any){
        console.error( 'Error al traer el tipo de servicio.', errores );
        res.status(500).json({ message:'Error interno del servidor.' });
        return;
    };
};

export const add = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TipoServicioRepositoryORM(em);
        const casouso = new RegistrarTipoServicio(repo);

        const dto = req.body;
        const resultado = await casouso.ejecutar(dto, em);
        if(Array.isArray(resultado)){
            res.status(400).json({ message: resultado });
            return;
        };

        res.status(201).json({ message: 'Tipo de servicio creado con exito', data:resultado });
        return;

    }catch(errores:any){
        console.error( 'Error al crear el tipo de servicio.', errores );
        res.status(500).json({ message:'Error interno del servidor.' });
        return;
    }
};

export const update = async (req:Request, res:Response):Promise<void> => {
    try{

        const {valor: codVal, error: codError} = validarCodigo(req.params.codigo_tipo, 'codigo tipo servicio');
        if(codError || codVal === undefined){
            res.status(400).json({ errores: codError });
            return;
        }; 

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TipoServicioRepositoryORM(em);
        const casouso = new ActualizarTipoServicio(repo);

        const dto = req.body;
        const actualizar = true;
        const {errores, tipoServicioActualizado} = await casouso.ejecutar(dto, em, codVal, actualizar);
        if(errores.length > 0 || tipoServicioActualizado === undefined){
            res.status(400).json({ message: errores });
            return;
        };

        res.status(200).json({ message: 'Tipo de actualizado con exito', data:tipoServicioActualizado });
        return;

    }catch(errores:any){
        console.error( 'Error al actualizar el tipo de servicio.', errores );
        res.status(500).json({ message:'Error interno del servidor.' });
        return;
    };
};
/*
async function update(req: Request, res: Response) {
    try {
        const codigo_tipo = Number(req.params.codigo_tipo);
        if (isNaN(codigo_tipo)) {
            return res.status(400).json({ message: 'Código de tipo de servicio inválido' });
        }

        const tipoServicio = await em.findOne(TipoServicio, { codigo_tipo });
        if (!tipoServicio) {
            return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        }

        const { nombre, descripcion, duracion_estimada, precio_base } = req.body.sanitizedInput;

        // Actualizar los demás campos
        em.assign(tipoServicio, { nombre, descripcion, duracion_estimada, precio_base });
        await em.flush();

        return res.status(200).json({ message: 'Tipo de servicio actualizado correctamente', data: tipoServicio });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}*/

export const remove = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codVal, error: codError} = validarCodigo(req.params.codigo_tipo, 'codigo tipo servicio');
        if(codError || codVal === undefined){
            res.status(400).json({ errores: codError });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TipoServicioRepositoryORM(em);
        const casouso = new EliminarTipoServicio(repo);

        const errores = await casouso.ejecutar(codVal);
        if(errores.length > 0){
            res.status(400).json({ message: errores });
            return;
        };

        res.status(200).json({ message: 'Tipo de servicio eliminado.' });
        return;

    }catch(errores:any){
        console.error( 'Error al eliminar el tipo de servicio.', errores );
        res.status(500).json({ message:'Error interno del servidor.' });
        return;
    };
};

export const obtnerMisServicios = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor:codTS, error:codError} = validarCodigo(req.params.codigo_tipo, 'codigo tipo servicio');
        if(codError || codTS === undefined){
            res.status(404).json({ errores: codError });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TipoServicioRepositoryORM(em);
        const casouso = new ObtenerMisServicios(repo);

        const resultado = await casouso.ejecutar(codTS);

        if(typeof resultado === 'string'){
            res.status(404).json({ message: resultado, data:[] });
            return;
        };

        const servicios = resultado.servicio;
        if(servicios.length === 0){
            res.status(200).json({ message: 'El tipo de servicio no tiene servicos asociados.', data:servicios });
            return;
        };

        res.status(200).json({ message: 'Servicios encontrados para el tipo de servicio.', data:servicios });
        return;

    }catch(errores:any){
        console.error('',errores)
    };
};