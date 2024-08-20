import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Servicio } from "./servicio.entity.js";
import { Turno } from "../turno/turno.entity.js";

const em = orm.em


function sanitizeServicioInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        monto: req.body.monto,
        estado: req.body.estado,
        adicional_adom: req.body.adicional_adom,
        ausencia_cliente: req.body.ausencia_cliente,
        medio_pago: req.body.medio_pago,
        turno: req.body.turno // Manejamos `turno` como un objeto relacionado.
    };
    // Eliminar cualquier propiedad que sea `undefined`.
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });

    next();
}

async function findAll(req:Request, res:Response){
    try{
        const servicio = await em.find(Servicio, {})
        res.status(200).json({message: 'Todos los servicios encontrados', data: servicio})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function getOne(req: Request, res:Response ){
    try{
        const codigo = Number.parseInt(req.params.codigo)
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        }
        const servicio = await em.findOne(Servicio, { codigo });
        if (servicio) {
            res.status(200).json({ message: 'Servicio encontrado', data: servicio });
        } else {
            res.status(404).json({ message: 'Servicio no encontrado' });
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function add(req: Request, res:Response){
    try{
        const { turno: turnoData, ...servicioData } = req.body;
        // Verificamos si el turno existe en la base de datos
        const turno = await em.findOne(Turno, { codigo_turno: turnoData.codigo_turno });
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }

        // Verificar si el turno ya tiene un servicio asociado
        if (turno.servicio) {
            return res.status(400).json({ message: 'El turno ya tiene un servicio asociado' });
        }

        // Crear el servicio asociando el turno
        const servicio = em.create(Servicio, {...servicioData, turno });
        await em.flush();

        // Remover el ciclo de la respuesta
        const { turno: turnoResult, ...servicioRestante } = servicio;
        const turnoSinServicio = { ...turnoResult, servicio: undefined };
        res.status(201).json({ message: 'Servicio creado', data: { ...servicioRestante, turno: turnoSinServicio } });
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function update(req: Request, res: Response) {
    try {
        const codigo = Number(req.params.codigo);
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        }

        const servicioAActualizar = await em.findOne(Servicio, { codigo });
        if (!servicioAActualizar) {
            return res.status(404).json({ message: 'El servicio no existe' });
        }

        // Verificar si sanitizedInput existe
        if (!req.body.sanitizedInput) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        }

        const { codigo_turno, ...restoDatos } = req.body.sanitizedInput;

        // Si se proporciona un código de turno, verificar si el turno existe
        if (codigo_turno !== undefined) {
            const nuevoTurno = await em.findOne(Turno, { codigo_turno });
            if (!nuevoTurno) {
                return res.status(404).json({ message: 'El código del turno no existe' });
            }

            // Verificar si el nuevo turno ya tiene un servicio asociado
            const servicioExistente = await em.findOne(Servicio, { turno: nuevoTurno });
            if (servicioExistente && servicioExistente.codigo !== servicioAActualizar.codigo) {
                return res.status(400).json({
                    message: 'Conflicto de clave única',
                    error: 'El turno ya tiene un servicio asociado. Por favor, elige otro turno o elimina el servicio existente.'
                });
            }
            // Actualizar el turno en la entidad Servicio
            servicioAActualizar.turno = nuevoTurno;
        }

        // Actualizar los demás campos
        em.assign(servicioAActualizar, restoDatos);
        await em.flush();

        res.status(200).json({ message: 'Servicio actualizado correctamente', data: servicioAActualizar });
    } catch (error: any) {
        // Manejar el error de clave única de MySQL
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Conflicto de clave única',
                error: 'El turno ya está asociado a otro servicio. Por favor, elige otro turno o elimina el servicio existente.'
            });
        }
        res.status(500).json({ message: error.message });
    }
}


async function remove(req: Request, res: Response){
    try {
        const codigo = Number(req.params.codigo.trim());
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        }
        const servicio = await em.findOne(Servicio, { codigo });
        if (!servicio) {
            return res.status(404).json({ message: 'El servicio no existe' });
        }
        // Eliminar el servicio de la base de datos
        await em.removeAndFlush(servicio);
        res.status(200).json({ message: 'Servicio eliminado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export {sanitizeServicioInput, findAll, getOne, add, update, remove}