import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Cliente } from "./clientes.entity.js";

const em = orm.em //Especie de repositorio de todas las entidades que tenemos.

async function findAll(req:Request, res:Response){  //FUNCIONAL
    try{
        const cliente = await em.find(Cliente, {})
        res.status(200).json({message: 'Todos los clientes encontrados', data: cliente})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function getOne(req: Request, res:Response ){  //FUNCIONAL
    try{
        const codigo_cliente = Number.parseInt(req.params.codigo_cliente)
        if (isNaN(codigo_cliente)) {// Verifica si el parámetro es un número válido
            return res.status(400).json({ message: 'Código de cliente inválido' });
        }
        // Buscar el cliente usando `findOne` en lugar de `findOneOrFail`
        const cliente = await em.findOne(Cliente, { codigo_cliente });

        // Maneja el caso cuando el cliente no se encuentra
        if (cliente) {
            res.status(200).json({ message: 'Cliente encontrado', data: cliente });
        } else {
            res.status(404).json({ message: 'Cliente no encontrado' });
        }
    }catch(error:any){
        res.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
};

async function add(req: Request, res:Response){  //FUNCIONAL
    try{
        const cliente = em.create(Cliente, req.body)
        await em.flush()
        res.status(201).json({message: 'Cliente creado', data: cliente})
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function update(req: Request, res: Response){ //FUNCIONAL
    try{
        const codigo_cliente = Number.parseInt(req.params.codigo_cliente)
        if(isNaN(codigo_cliente)){
            return res.status(400).json({ message: 'Código de cliente inválido' });
        }
        const cliente = await em.findOne(Cliente, { codigo_cliente });

        if(!cliente){
            res.status(404).json({ message: 'Cliente no encontrado' })
        } else{
            em.assign(cliente, req.body)
            await em.flush()
            res.status(200).json({message: 'Cliente actualizado'})
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

async function remove(req: Request, res: Response){ //FUNCIONAL
    try{
        const codigo_cliente = Number.parseInt(req.params.codigo_cliente)
        if(isNaN(codigo_cliente)){
            return res.status(400).json({ message: 'Código de cliente inválido' });
        }
        const cliente = await em.findOne(Cliente, { codigo_cliente });
        if(!cliente){
            res.status(404).json({ message: 'Cliente no encontrado' })
        } else{
            await em.removeAndFlush(cliente)
            res.status(200).json({message: 'Cliente borrado Exitosamente'})
        }
    }catch(error:any){
        res.status(500).json({message: error.message})
    }
};

export { findAll, getOne, add, update, remove}
