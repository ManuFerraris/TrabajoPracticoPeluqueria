import { Request, Response } from "express";
import { MikroORM } from "@mikro-orm/core";
import { validarCodigo } from "../application/validarCodigo.js";
import { PeluqueroRepositoryORM } from "../shared/db/PeluqueroRepositoryORM.js";
import { FindAll } from "../application/casos-uso/casosUsoPeluquero/ListarPeluqueros.js";
import { BuscarPeluquero } from "../application/casos-uso/casosUsoPeluquero/BuscarPeluquero.js";
import { RegistrarPeluquero } from "../application/casos-uso/casosUsoPeluquero/RegistrarPeluquero.js";
import { ActualizarPeluquero } from "../application/casos-uso/casosUsoPeluquero/ActualizarPeluquero.js";
import { EliminarPeluquero } from "../application/casos-uso/casosUsoPeluquero/EliminarPeluquero.js";
import { PeluqueroConMasClientes } from "../application/casos-uso/casosUsoPeluquero/PeluqueroConMasClientes.js";
import { GetMisTurnos } from "../application/casos-uso/casosUsoPeluquero/MisTurnosPeluquero.js";
import { BuscarPeluqueroPorEmail } from "../application/casos-uso/casosUsoPeluquero/BuscarPeluqueroPorEmail.js";
import { HistMisTurnosPeluquero } from "../application/casos-uso/casosUsoPeluquero/HistMisTurnosPeluquero.js";
import { TurnoRepositoryORM } from "../shared/db/TurnoRepositoryORM.js";
import { TipoServicioRepositoryORM } from "../shared/db/TipoServicioRepositoryORM.js";
import { HorariosDisponibles } from "../AltaTurno/HorariosDisponibles.js"; 

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
            res.status(404).json({ message: peluqueroActualizado[0] })
            return;
        };

        res.status(200).json({
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
        if (!req.user || !req.user.rol) {
            res.status(401).json({ message: "No autenticado. Token inválido o ausente." });
            return;
        };

        const { valor: codigo_peluquero, error: error} = validarCodigo(req.params.codigo_peluquero, 'codigo de peluquero');
        if(error || codigo_peluquero === undefined){
            res.status(404).json({ message: error ?? 'codigo invalido'});
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casouso = new GetMisTurnos(repo);

        const loggedInUserId = req.user.codigo;
        const userRole = req.user.rol;
        if (userRole === 'peluquero' && codigo_peluquero !== loggedInUserId) {
            res.status(403).json({ message: "No autorizado para ver este historial." });
            return;
        };

        const resultado = await casouso.ejecutar(codigo_peluquero);
        console.log("Resultado del metodo: ", resultado);
        if(typeof resultado === 'string'){
            res.status(404).json({ message: resultado });
            return;
        };
        if(resultado.turnos.length === 0){
            res.status(200).json({ message: 'No posee turnos asignados', data:[], cantidadTurnos: resultado.cantTurnosHoy });
            return;
        };

        res.status(200).json({ data: resultado, cantidadTurnos:resultado.cantTurnosHoy });
        return;

    }catch(errores:any){
        console.error('Error al traer los turnos del peluquero ', errores);
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const obtenerHistorialPeluquero = async (req:Request, res:Response):Promise<void> => {
    try{
        const { valor: codigo_peluquero, error: error} = validarCodigo(req.params.codigo_peluquero, 'codigo de peluquero');
        if(error || codigo_peluquero === undefined){
            res.status(404).json({ message: error ?? 'codigo invalido'});
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new HistMisTurnosPeluquero(repo);

        const loggedInUserId = req.user.codigo;
        const userRole = req.user.rol;
        if (userRole === 'peluquero' && codigo_peluquero !== loggedInUserId) {
            res.status(403).json({ message: "No autorizado para ver este historial." });
            return;
        };

        const resultado = await casouso.ejecutar(codigo_peluquero, em);

        if(typeof resultado === 'string'){
            res.status(404).json({ message: resultado });
            return;
        };
        if(resultado.length === 0){
            res.status(200).json({ message: 'No posee turnos asignados', data:[] });
            return;
        };

        res.status(200).json({ data: resultado });
        return;

    }catch(errores:any){
        console.error('Error al eliminar al peluquero ', errores);
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const buscarPeluqueroPorEmail = async(req:Request, res:Response):Promise<void> => {
    try {
        const email = req.params.email;
        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new PeluqueroRepositoryORM(em);
        const casoUso = new BuscarPeluqueroPorEmail(repo);
    
        const peluquero = await casoUso.ejecutar(email);
        if (!peluquero) {
            res.status(404).json({ message: 'Peluquero no encontrado' });
            return;
        };
    
        res.status(200).json({ data: peluquero });
        return;
    }catch (error: any) {
        console.error('Error al buscar peluquero por email:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
        return;
    };
};

export const horariosDisponibles = async (req:Request, res:Response):Promise<void> => {
    try{
        const fecha = req.query.fechaHora as string;
        const {valor: codPeluquero, error:codPelError} = validarCodigo(req.params.codigo_peluquero, 'codigo peluquero');
        if(codPelError || codPeluquero === undefined){
            res.status(404).json({ errores: codPelError});
            return;
        };

        const {valor: codTipoSer, error: codTSError} = validarCodigo(req.params.codigo_tipo, 'codigo Tipo Servicio');
        if(codTSError || codTipoSer === undefined){
            res.status(404).json({ errores: codTSError});
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const turnoRepo = new TurnoRepositoryORM(em);
        const tipoSerRepo = new TipoServicioRepositoryORM(em);
        const pelRepo = new PeluqueroRepositoryORM(em);

        const casouso = new HorariosDisponibles(pelRepo, turnoRepo, tipoSerRepo);

        const resultado = await casouso.ejecutar(codPeluquero, codTipoSer, fecha, em);

        if(resultado.errores){
            res.status(404).json({ message: resultado.errores });
            return;
        };

        if (!resultado.horarios || resultado.horarios.length === 0) {
            res.status(200).json({ message: 'No hay horarios disponibles para ese peluquero en dicho día.', data: [] });
            return;
        };

        res.status(200).json({ message: 'Horarios disponibles encontrados.', data: resultado.horarios });
        return;

    }catch(errores:any){
        console.error('Error al cargar los horarios disponibles.', errores);
        res.status(500).json({ message: 'Error interno del servidor', errores });
        return;
    };
};