import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Localidad } from "./localidad.entity.js";
import { Cliente } from "../cliente/clientes.entity.js";

const em = orm.em

function sanitizeLocalidadInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        nombre:req.body.nombre,
        provincia:req.body.provincia,
        codigo_postal: req.body.codigo_postal,
        pais: req.body.pais,
        descripcion: req.body.descripcion,
        }
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}

async function findAll(req:Request, res:Response){  //FUNCIONAL
    try{
        const localidad = await em.find(Localidad, {})
        return res.status(200).json({message: 'Todas las localidades encontradas', data: localidad})
    }catch(error:any){
        return res.status(500).json({message: error.message})
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
        return res.status(500).json({message: error.message})
    }
};

async function add(req: Request, res:Response){
    try{
        const localidad = em.create(Localidad, req.body)
        await em.flush()
        return res.status(201).json({message: 'Localidad dada de alta', data: localidad})
    }catch(error:any){
        return res.status(500).json({message: error.message})
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
            return res.status(404).json({ message: 'Localidad no encontrada' })
        } else{
            em.assign(localidad, req.body)
            await em.flush()
            return res.status(200).json({message: 'Localidad Actualizada'})
        }
    }catch(error:any){
        return res.status(500).json({message: error.message})
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
            return res.status(404).json({ message: 'Localidad no encontrada' })
        }
        const clientes = await em.find(Cliente, { localidad });
        if (clientes.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar la localidad porque tiene clientes asignados' });
        }
        await em.removeAndFlush(localidad)
        return res.status(200).json({message: 'Localidad eliminada'})

    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
};

export { findAll, getOne, add, update, remove, sanitizeLocalidadInput}