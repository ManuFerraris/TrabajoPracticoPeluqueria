import { Request, Response, NextFunction } from "express";
import { ClienteRepository } from "./cliente.repository.js";
import { Cliente } from "./clientes.entity.js";

const repository = new ClienteRepository()

function sanitizeClienteInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        dni: req.body.dni,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        direccion: req.body.direccion,
        mail: req.body.mail,
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

function findAll(req:Request, res:Response){
    res.json({data:repository.findAll() })
};

function getOne(req: Request, res:Response ){
    const codigo = parseInt(req.params.codigo, 10); // Convertir el parámetro codigo a número
    const cliente = repository.getOne({codigo})
    if(!cliente){
        return res.status(404).send({message: 'Cliente no encontrado' }) 
    };
    res.json({data: cliente});
};

function add(req: Request, res:Response){
    const input = req.body.sanitizedInput
    const clienteInput = new Cliente(
        parseInt(input.codigo, 10),
        parseInt(input.dni, 10),
        input.nombre,
        input.apellido,
        input.direccion,
        input.mail,
        input.telefono
    )
    const cliente = repository.add(clienteInput) //lo agregamos al contenido de nuestra coleccion
    return res.status(201).send({message: 'Cliente Creado', data: cliente}); //Este states indica que se creo el recurso.
};

function update(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10); // Convertir el parámetro codigo a número
    const input = req.body.sanitizedInput
    input.codigo = codigo
    const cliente = repository.update(input)

    if(!cliente){ //no lo encontro
        return res.status(404).send({message: 'Cliente no encontrado' })
    }
    return res.status(200).send({message:'Actualizacion exitosa', data: cliente})
};

function remove(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const cliente = repository.delete({codigo})

    if(!cliente){
        res.status(404).send({message: 'Cliente no encontrado' })
    } else{
    res.status(200).send({message: 'Cliente borrado exitosamente'})
    }
};

export {sanitizeClienteInput, findAll, getOne, add, update, remove}