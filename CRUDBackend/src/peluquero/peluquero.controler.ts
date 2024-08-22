import { Request, Response } from "express"
import { orm } from "../shared/db/orm.js"
import { Peluquero } from "./peluqueros.entity.js"

const em = orm.em

async function findAll(req: Request, res:Response){  //FUNCIONAL
    try{
        const peluquero = await em.find(Peluquero, {})
        res.status(200).json({message: 'Todos los peluqueros encontrados', data: peluquero})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
}

async function getOne(req:Request, res:Response){  //FUNCIONAL
    try{
        const codigo_peluquero = Number.parseInt(req.params.codigo_peluquero)
        if (isNaN(codigo_peluquero)) {
            return res.status(400).json({ message: 'Código de peluquero inválido' });
        }
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });

        if (peluquero) {
            res.status(200).json({ message: 'Peluquero encontrado', data: peluquero });
        } else {
            res.status(404).json({ message: 'Peluquero no encontrado' });
        }
    }catch(error:any){
        res.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
};

async function add(req: Request, res:Response){ //FUNCIONAL
    try{
        const peluquero = em.create(Peluquero, req.body)
        await em.flush()
        res.status(201).json({message: 'Peluquero creado', data: peluquero})
    }catch(error:any){
        res.status(500).json({message: error.message})
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
            res.status(200).json({message: 'Peluquero actualizado'})
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
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
            res.status(404).json({ message: 'Peluquero no encontrado' })
        } else{
            await em.removeAndFlush(peluquero)
            res.status(200).json({message: 'Peluquero borrado Exitosamente'})
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

export {findAll, getOne, add, update, remove}