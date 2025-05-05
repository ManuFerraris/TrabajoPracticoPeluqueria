import { Request, Response, NextFunction } from "express"
import { orm } from "../shared/db/orm.js"
import { Peluquero } from "./peluqueros.entity.js"
import { Turno } from "../turno/turno.entity.js"

const em = orm.em

function sanitizePeluqueroInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        nombre:req.body.dni,
        fecha_Ingreso:req.body.NomyApe,
        tipo: req.body.email,
        }
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}

async function findAll(req: Request, res:Response){  //FUNCIONAL
    try{
            const peluquero = await em.findOne(Peluquero, {
                codigo_peluquero: req.user.codigo
            });
            
            if (!peluquero) {
                return res.status(404).json({ message: "Peluquero no encontrado" });
            }
            
            return res.json(peluquero);
        }catch(error:any){
            console.error("Error al obtener peluquero:", error);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
};

async function getOne(req:Request, res:Response){  //FUNCIONAL
    try{
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero)
        if (isNaN(codigo_peluquero)) {
            return res.status(400).json({ message: 'Código de peluquero inválido' });
        }
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });

        if (peluquero) {
            return res.status(200).json({ message: 'Peluquero encontrado', data: peluquero });
        } else {
            return res.status(404).json({ message: 'Peluquero no encontrado' });
        }
    }catch(error:any){
        return res.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
};

async function add(req: Request, res:Response){ //REVISAR
    try {
        const { nombre, fecha_Ingreso, tipo } = req.body;
        // Validación de campos
        if (!nombre || !fecha_Ingreso || !tipo) {
            return res.status(400).json({ message: 'Todos los campos son requeridos' });
        }
        if (isNaN(Date.parse(fecha_Ingreso))) {
            return res.status(400).json({ message: 'Fecha de ingreso inválida' });
        }
        const peluquero = new Peluquero()
        peluquero.nombre = nombre,
        peluquero.fecha_Ingreso = new Date(fecha_Ingreso),
        peluquero.tipo = tipo

        em.persist(peluquero);
        await em.flush();
        return res.status(201).json({ message: 'Peluquero creado', data: peluquero });
    }catch(error: any) {
        return res.status(500).json({ message: error.message });
    }
};

async function update(req: Request, res: Response){ //FUNCIONAL
    try{
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero)
        if(isNaN(codigo_peluquero)){
            return res.status(400).json({ message: 'Código de peluquero inválido' });
        }
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });

        if(!peluquero){
            res.status(404).json({ message: 'Peluquero no encontrado' })
        } else{
            em.assign(peluquero, req.body)
            await em.flush()
            return res.status(200).json({message: 'Peluquero actualizado'})
        }
    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
};

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

export {findAll, getOne, add, update, remove, sanitizePeluqueroInput}