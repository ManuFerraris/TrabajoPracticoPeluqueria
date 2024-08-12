import { Request, Response, NextFunction } from "express";
import { ClienteRepository } from "./cliente.repository.js";
import { Cliente } from "./clientes.entity.js";

const repository = new ClienteRepository()

function sanitizeClienteInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        dni: req.body.dni,
        NomyApe: req.body.NomyApe,
        direccion: req.body.direccion,
        email: req.body.email,
        telefono: req.body.telefono,
    }
    //Mas validaciones para la seguridad e integridad de los datos
    //Para quitar el elemento que no queremos:
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next() 
}

async function findAll(req:Request, res:Response){
    res.json({data:await repository.findAll() })
};

async function getOne(req: Request, res:Response ){
    const codigo = parseInt(req.params.codigo, 10); // Convertir el parámetro codigo a número
    const cliente = await repository.getOne({codigo})
    if(!cliente){
        return res.status(404).send({message: 'Cliente no encontrado' }) 
    };
    res.json({data: cliente});
};

async function add(req: Request, res:Response){
    const input = req.body.sanitizedInput

    const clienteInput = new Cliente(
        parseInt(input.codigo, 10),
        parseInt(input.dni, 10),
        input.NomyApe,
        input.direccion,
        input.email,
        input.telefono
    )
    const cliente = await repository.add(clienteInput) //lo agregamos al contenido de nuestra coleccion
    return res.status(201).send({message: 'Cliente Creado', data: cliente}); //Este states indica que se creo el recurso.
};

async function update(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10); // Convertir el parámetro codigo a número
    const input = req.body.sanitizedInput
    input.codigo = codigo
    
    const cliente = await repository.update(input)

    if(!cliente){ //no lo encontro
        return res.status(404).send({message: 'Cliente no encontrado' })
    }
    return res.status(200).send({message:'Actualizacion exitosa', data: cliente})
};

async function remove(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const cliente = await repository.delete({codigo})

    if(!cliente){
        res.status(404).send({message: 'Cliente no encontrado' })
    } else{
    res.status(200).send({message: 'Cliente borrado exitosamente'})
    }
};

export {sanitizeClienteInput, findAll, getOne, add, update, remove}