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
import { validarEstadoTurno } from "../application/validarEstadoTurno.js";
import { FiltroTurnoPorPeluqueroYEstado } from "../application/casos-uso/casosUsoTurno/filtrosPorTurno.js";
import { validarCodigo } from "../application/validarCodigo.js";
import { CambiarEstado } from "../application/casos-uso/casosUsoTurno/CambiarEstado.js";
import { AltaTurno } from "../AltaTurno/AltaTurno.js";

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

        res.status(200).json({ message:'Turnos encontrados.', data: turnos });
        return;

    }catch(error:any){
        console.error('Error al buscar los turnos.',error);
        res.status(500).json({message: error.message})
        return;
    };
};

export const getOne = async (req: Request, res:Response ):Promise<void> => { //FUNCIONAL
    try{
        const codTur = req.params.codigo_turno;
        const { valor: codTurno, error: errorCodigo } = validarCodigo(codTur, 'codigo de turno');
        if(errorCodigo || codTurno === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new BuscarTurno(repo);

        const turno = await casouso.ejecutar(codTurno);

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

        const codTur = req.params.codigo_turno;
        const { valor: codTurno, error: errorCodigo } = validarCodigo(codTur, 'codigo de turno');
        if(errorCodigo || codTurno === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

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
        const { valor: codTur, error: errorCodigo } = validarCodigo(codigo_turno, 'codigo de turno');
        if(errorCodigo || codTur === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const turnoRepo = new TurnoRepositoryORM(em);
        const servicioRepo = new ServicioRepositoryORM(em);
        const casouso = new EliminarTurno(turnoRepo, servicioRepo);

        const errores = await casouso.ejecutar(codTur);

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
    };
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

export const filtrosPorTurno = async (req:Request, res:Response):Promise<void> => {
    try{
        const estado = String(req.query.estado);
        const errorEstado = validarEstadoTurno(estado);
        if(errorEstado){
            res.status(404).json({ message: errorEstado });
            return;
        };

        const { valor: codPel, error: errorCodigo } = validarCodigo(req.query.codigo_peluquero, 'codigo de peluquero');
        if(errorCodigo || codPel === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new FiltroTurnoPorPeluqueroYEstado(repo);

        const turnos = await casouso.ejecutar(estado, codPel);
        if(turnos.length === 0){
            res.status(200).json({ data: [], message: `No se encontraron turnos con el estado: ${estado} para dicho peluquero.` });
            return;
        };

        res.status(200).json({data: turnos});
        return;
        
    }catch(errores:any){
        console.error('Ha ocurrido un error al filtrar los turnos por su estado.', errores);
        res.status(500).json({ message: 'Error interno del servidor', errores});
        return;
    }
};

export const cambiarEstado = async (req:Request, res:Response):Promise<void> => {
    try{
        const {codigo_turno} = req.params;
        const { valor: codTur, error: errorCodigo } = validarCodigo(codigo_turno, 'codigo de turno');
        if(errorCodigo || codTur === undefined){
            res.status(400).json({ message: errorCodigo ?? 'Codigo invalido' });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const turnoRepo = new TurnoRepositoryORM(em);
        const casouso = new CambiarEstado(turnoRepo);
    
        const { estado } = req.body;
        const resultado = await casouso.ejecutar(codTur, estado);

        if(typeof resultado === 'string'){
            res.status(404).json({ message: resultado });
            return;
        };

        res.status(200).json({
            message: 'Estado cambiado con exito!',
            data: {
                codigo_turno: resultado.codigo_turno,
                estado: resultado.estado
            }
        });
        return;
    
    }catch(errores:any){
        console.error('Error al cambiar el estado al turno.', errores);
        res.status(500).json({ message:'Error interno del servidor.',errores });
        return;
    };
};

export const altaTurno = async (req:Request, res:Response):Promise<void> => {
    try{
        const {turno, servicio} = req.body;

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const turnoRepo = new TurnoRepositoryORM(em);
        const servicioRepo = new ServicioRepositoryORM(em);
        const casouso = new AltaTurno(turnoRepo, servicioRepo);

        const resultado = await casouso.ejecutar(turno, servicio, em);
        if(Array.isArray(resultado)){
            res.status(400).json({ message:'Ha ocurrido un error a la hora de crear un turno:', data:resultado});
            return;
        };
        // Probamos serializar porque se guarda pero aun asi responde con un 500.
        const TurnoConServicioDTO = {
            turno: {
                codigo_turno: turno.codigo_turno,
                fecha_hora: turno.fecha_hora,
                tipo_turno: turno.tipo_turno,
            },
            servicio: {
                monto: servicio.monto,
                medio_pago: servicio.medio_pago,
                tipo_servicio_codigo: servicio.tipo_servicio_codigo,
            }
        };

        console.log("Resultado listo para enviar:", resultado);
        console.log("Resultado serializado: ", TurnoConServicioDTO);

        res.status(201).json({data: TurnoConServicioDTO});
        return;

    }catch(error:any){
        console.error('Error al registrar el alta del turno', error);
        res.status(500).json({ message: 'Error interno del servidor', error });
        return;
    };
};