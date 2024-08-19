import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Localidad } from "./localidad.entity.js";

const em = orm.em

async function findAll(req:Request, res:Response){  //FUNCIONAL
    try{
        const localidad = await em.find(Localidad, {})
        res.status(200).json({message: 'Todas las localidades encontradas', data: localidad})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function getOne(req: Request, res:Response ){  //HAY QUE PROBAR
    try{
        const codigo = Number.parseInt(req.params.codigo)
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de localidad inválido' });
        }
        
        const localidad = await em.findOne(Localidad, { codigo });

        if (localidad) {
            res.status(200).json({ message: 'Localidad encontrada', data: localidad });
        } else {
            res.status(404).json({ message: 'Localidad no encontrada' });
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function add(req: Request, res:Response){  
    try{
        const localidad = em.create(Localidad, req.body)
        await em.flush()
        res.status(201).json({message: 'Localidad dada de alta', data: localidad})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function update(req: Request, res: Response){ 
    try{
        const codigo = Number.parseInt(req.params.codigo)
        if(isNaN(codigo)){
            return res.status(400).json({ message: 'Código de localidad inválido' });
        }
        const localidad = await em.findOne(Localidad, { codigo });

        if(!localidad){
            res.status(404).json({ message: 'Localidad no encontrada' })
        } else{
            em.assign(localidad, req.body)
            await em.flush()
            res.status(200).json({message: 'Localidad Actualizada'})
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function remove(req: Request, res: Response){ 
    try{
        const codigo = Number.parseInt(req.params.codigo)
        if(isNaN(codigo)){
            return res.status(400).json({ message: 'Código de Localidad inválido' });
        }
        const localidad = await em.findOne(Localidad, { codigo });
        if(!localidad){
            res.status(404).json({ message: 'Localidad no encontrada' })
        } else{
            await em.removeAndFlush(localidad)
            res.status(200).json({message: 'Localidad eliminada'})
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

export { findAll, getOne, add, update, remove}