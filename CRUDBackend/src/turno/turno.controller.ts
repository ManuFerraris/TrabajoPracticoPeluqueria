import { Request, Response, NextFunction } from "express";
import { validarParametrosFiltrado } from "./funcionesTurno/validarparametrosFiltrados.js";
import { MikroORM } from "@mikro-orm/mysql";

import { ListarTurnosFiltrados } from "../application/casos-uso/casosUsoTurno/ListarTurnosFiltrados.js";
import { ListarTurnosCanceladosPorMes } from "../application/casos-uso/casosUsoTurno/ListarTurnosCancelados.js";
import { TurnoRepositoryORM } from "../shared/db/TurnoRepositoryORM.js";
import { ListarTurnos } from "../application/casos-uso/casosUsoTurno/getAllTurnos.js";
import { BuscarTurno } from "../application/casos-uso/casosUsoTurno/BuscarTurno.js";
import { EliminarTurno } from "../application/casos-uso/casosUsoTurno/EliminarTurno.js";
import { ServicioRepositoryORM } from "../shared/db/ServicioRepositoryORM.js";
import { RegistrarTurno } from "../application/casos-uso/casosUsoTurno/RegistrarTurno.js";
import { RegistrarTurnoDTO, validarTurnoDTO } from "../application/dtos/RegistrarTurnoDTO.js";
import { ActualizarTurno } from "../application/casos-uso/casosUsoTurno/ActualizarTurno.js";

function sanitizeTurnoInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        codigo_peluquero:req.body.codigo_peluquero,
        codigo_cliente:req.body.codigo_cliente,
        //codigo_servicio: req.body.codigo_servicio,
        fecha_hora: req.body.fecha_hora,
        tipo_turno: req.body.tipo_turno,
        porcentaje: req.body.porcentaje,
        estado: req.body.estado
    }
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
};

export const findAll = async (req:Request, res:Response):Promise<void> => { //FUNCIONAL
    try{
        const orm = (req.app.locals as {orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new ListarTurnos(repo);

        const turnos = await casouso.ejecutar();

        if(turnos.length === 0){
            res.status(400).json({ movimientos: [], message: 'No se encontraron turnos.' });
            return;
        };

        res.status(200).json(turnos);
        return;

    }catch(error:any){
        console.error('Error al buscar los turnos.',error);
        res.status(500).json({message: error.message})
        return;
    };
};

export const getOne = async (req: Request, res:Response ):Promise<void> => { //FUNCIONAL
    try{
        const {codigo_turno} = req.params;
        
        console.log("Codigo de turno", codigo_turno)
        if (!codigo_turno) {
            res.status(400).json({ message: 'Código de turno inválido' });
            return;
        };
        const codigoNumero = Number(codigo_turno);

        if(isNaN(codigoNumero)){
            res.status(400).json({ message: 'El código de turno debe ser un numero.' });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new BuscarTurno(repo);

        const turno = await casouso.ejecutar(codigoNumero);

        if(!turno){
            res.status(400).json({message: 'No se encontro el turno' });
            return;
        };

        res.status(200).json(turno);
        return;
    }catch(error:any){
        console.error('Error al buscar el turno.',error);
        res.status(500).json({ message: error.message });
        return;
    };
};

export const add = async (req: Request, res:Response):Promise<void> => { 
    try{
        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new RegistrarTurno(repo);

        const dto: RegistrarTurnoDTO = req.body; // Data Transfer Object

        const errores = await validarTurnoDTO(dto, em);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0], turno: null });
            return;
        };

        const turno = await casouso.ejecutar(dto, em);

        res.status(201).json({ 
            message: 'Turno registrado correctamente.',
            data: turno
        });
        return;

    }catch(error:any){
        console.error('Error al registrar el turno.',error);
        res.status(500).json({ message: error.message });
        return;
    };
};

export const update = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new ActualizarTurno(repo);

        const codTurno = Number(req.params.codigo_turno);
        const dto = req.body;

        const actualizacion = true;
        const {errores, turnoActualizado} = await casouso.ejecutar(codTurno, dto, em, actualizacion);
        if(errores.length > 0 ){
            res.status(400).json({ message: errores[0] });
            return;
        };

        res.status(200).json({message:'Turno actualizado correctamente', data:turnoActualizado});
        return;
    }catch(error:any){
        console.error('Error al registrar el turno.',error);
        res.status(500).json({ message: error.message });
        return;
    };
};

export const remove = async (req: Request, res: Response):Promise<void> => {
    try{
        const {codigo_turno} = req.params;
        console.log("Codigo de turno", codigo_turno)

        if (!codigo_turno) {
            res.status(400).json({ message: 'Código de turno inválido' });
            return;
        };

        const codigoNumero = Number(codigo_turno);
        if(isNaN(codigoNumero)){
            res.status(400).json({ message: 'El código de turno debe ser un numero.' });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const turnoRepo = new TurnoRepositoryORM(em);
        const servicioRepo = new ServicioRepositoryORM(em);
        const casouso = new EliminarTurno(turnoRepo, servicioRepo);

        const errores = await casouso.ejecutar(codigoNumero);

        if (errores.length > 0){
            res.status(404).json({ message: errores[0] });
            return;
        };

        res.status(200).json({ message: 'Turno eliminado exitosamente' })
        return;

    }catch(error:any){
        console.error('Error al eliminar el turno.',error);
        res.status(500).json({message: error.message})
        return;
    }
};


export const listarTurnosFiltrados = async (req:Request, res:Response): Promise<void> => {
    try{
        const {mes} = req.query;
        
        if(!mes){
            res.status(400).json({ error: 'Falta el parametro \'mes\''});
            return;
        };

        const mesStr = req.query.mes?.toString() ?? '';

        const errores = validarParametrosFiltrado(mesStr);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0] });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new ListarTurnosFiltrados(repo);

        const turnos = await casouso.ejecutar(mes.toString());
        if(turnos.length === 0){
            res.status(404).json({ message: 'No se encontraron turnos filtrados' });
            return;
        };

        res.status(200).json(turnos);
        return;
    }catch(error){
        console.error('Error al listar turnos filtrados',error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    };
};

export const listarTurnosCanceladosPorMes = async(req: Request, res:Response): Promise<void> => {
    try{
        const {mes} = req.query;

        if(!mes){
            res.status(400).json({ error: 'Falta el parametro \'mes\''});
            return;
        };

        const mesStr = req.query.mes?.toString() ?? '';

        const errores = validarParametrosFiltrado(mesStr);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0] });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casoUso = new ListarTurnosCanceladosPorMes(repo);

        const turnosCancelados = await casoUso.ejecutar(mes.toString());

        if(turnosCancelados.length === 0){
            res.status(400).json({ message: 'No se encontraron turnos cancelados en dicho mes.'})
            return;
        };

        res.status(200).json(turnosCancelados);
        return;
    }catch(error){
        console.error('Error al listar turnos cancelados en dicho mes',error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    }
};