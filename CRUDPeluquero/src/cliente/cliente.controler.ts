import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Cliente } from "./clientes.entity.js";
import { Localidad } from "../localidad/localidad.entity.js";

const em = orm.em //Especie de repositorio de todas las entidades que tenemos.

function sanitizeClienteInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo_cliente: req.body.codigo_cliente,
        dni:req.body.dni,
        NomyApe:req.body.NomyApe,
        email: req.body.email,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        codigo_localidad: req.body.codigo_localidad
    }
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}

async function findAll(req:Request, res:Response){  //FUNCIONAL
    try{
        const cliente = await em.find(Cliente, {}, { populate: ['localidad'] })
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
        const cliente = await em.findOne(Cliente, { codigo_cliente }, { populate: ['localidad'] });

        // Maneja el caso cuando el cliente no se encuentra
        if (cliente) {
            return res.status(200).json({ message: 'Cliente encontrado', data: cliente });
        } else {
            return res.status(404).json({ message: 'Cliente no encontrado' });
        }
    }catch(error:any){
        res.status(500).json({ message: 'Error interno del servidor', details: error.message });
    }
}; 

async function add(req: Request, res:Response){  //FUNCIONAL
    try{
        const { codigo_localidad, dni, NomyApe, email, direccion, telefono } = req.body.sanitizedInput;
        const localidad = await em.findOne(Localidad, { codigo: codigo_localidad })
        if(!localidad){
            return res.status(404).json({message: 'Localidad no encontrada'})
        }
        const cliente = new Cliente();
        cliente.localidad = localidad;
        cliente.dni = dni;
        cliente.NomyApe = NomyApe;
        cliente.email = email;
        cliente.direccion = direccion;
        cliente.telefono = telefono;

        await em.persistAndFlush(cliente);
        res.status(201).json({message:'Cliente creado'})

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
        const clienteAActualizar = await em.findOne(Cliente, { codigo_cliente });

        if(!clienteAActualizar){
            return res.status(404).json({ message: 'Cliente no encontrado' })
        }
        console.log("Datos sanitizados:", req.body.sanitizedInput);
        if (!req.body.sanitizedInput || Object.keys(req.body.sanitizedInput).length === 0) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        }

        const { codigo_localidad } = req.body.sanitizedInput;
        const localidad = await em.findOne(Localidad, { codigo: codigo_localidad })
        if(!localidad){
            return res.status(404).json({message: 'Localidad no encontrada'})
        }
        clienteAActualizar.localidad = localidad;
        em.assign(clienteAActualizar!, req.body.sanitizedInput)
        await em.flush()
        
        res.status(200).json({message: 'Cliente actualizado', data:clienteAActualizar})
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

export { sanitizeClienteInput, findAll, getOne, add, update, remove}
