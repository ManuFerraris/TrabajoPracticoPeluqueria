import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Turno } from "./turno.entity.js";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";

const em = orm.em

function sanitizeTurnoInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        codigo_peluquero:req.body.codigo_peluquero,
        codigo_cliente:req.body.codigo_cliente,
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
}

async function findAll(req:Request, res:Response){ //FUNCIONAL
    try{
        const turno = await em.find(Turno, {}, { populate: ['cliente', 'peluquero']})
        if(!turno){
            res.status(404).json({message: 'No hay turnos cargados'})
        }
        res.status(200).json({message:'Todos los turnos encontados', data: turno})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
}

async function getOne(req: Request, res:Response ){ //FUNCIONAL
    try{
        const codigo_turno = Number(req.params.codigo_turno.trim())
        if (isNaN(codigo_turno)) {
            return res.status(400).json({ message: 'Código de turno inválido' });
        }
        const turno = await em.findOne(Turno, {codigo_turno}, { populate: ['cliente', 'peluquero'] })
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        res.status(201).json({message:'Turno encontrado', data:turno})
    }catch(error:any){
        res.status(500).json({ message: error.message })
    }
}

async function add(req: Request, res:Response){ //FUNCIONAL
    try{
        // Extraemos los códigos de cliente y peluquero del cuerpo de la solicitud
        const { codigo_cliente, codigo_peluquero, fecha_hora, tipo_turno, porcentaje, estado } = req.body;

        // Verificamos si el cliente y el peluquero existen
        const cliente = await em.findOne(Cliente, { codigo_cliente });
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });

        if(!cliente && !peluquero){
            return res.status(404).json({message: 'Los codigos del cliente y peluquero no existen'})
        }
        if(!cliente){
            return res.status(404).json({message: 'El codigo del cliente no existe'})
        }
        if(!peluquero){
            return res.status(404).json({message: 'El codigo del peluquero no existe'})
        }
        //Creacion del turno
        const turno = em.create(Turno, {cliente,
            peluquero,
            fecha_hora,
            tipo_turno,
            porcentaje,
            estado
        }, req.body.sanitizeTurnoInput)
        await em.flush()

        res.status(201).json({ message: 'Turno creado', data:turno})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
}

async function update(req: Request, res: Response){
    try{
        const codigo_turno = Number(req.params.codigo_turno)
        if (isNaN(codigo_turno)) {
            return res.status(400).json({ message: 'Código de turno inválido' });
        }
        const turnoAActualizar = await em.findOne(Turno, {codigo_turno})
        if (!turnoAActualizar) {
            return res.status(404).json({ message: 'El turno no existe' });
        }
        // Verificar si sanitizedInput existe
        if (!req.body.sanitizedInput) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        }

        const { codigo_cliente, codigo_peluquero } = req.body.sanitizedInput;

        // Verificar si el código del cliente existe
        if (codigo_cliente) {
            const cliente = await em.findOne(Cliente, { codigo_cliente });
            if (!cliente) {
                return res.status(404).json({ message: 'El código del cliente no existe' });
            }
        }
        // Verificar si el código del peluquero existe
        if (codigo_peluquero) {
            const peluquero = await em.findOne(Peluquero, { codigo_peluquero });
            if (!peluquero) {
                return res.status(404).json({ message: 'El código del peluquero no existe' });
            }
        }

        em.assign(turnoAActualizar, req.body.sanitizedInput)
        await em.flush()
        res.status(200).json({ message:'Turno actualizado correctamente', data:turnoAActualizar})

    }catch(error:any){
        res.status(500).json({message: error.message})
    }
}

async function remove(req: Request, res: Response){
    try{
        const codigo_turno = Number(req.params.codigo_turno.trim())
        if (isNaN(codigo_turno)) {
            return res.status(400).json({ message: 'Código de turno inválido' });
        }
        const turno = await em.findOne(Turno, { codigo_turno });
        if (!turno){
            return res.status(404).json({ message: 'El turno no existe' });
        }
        await em.removeAndFlush(turno)
        res.status(200).json({ message: 'Turno eliminado exitosamente' })
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
}
export {findAll, getOne, add, update, remove}