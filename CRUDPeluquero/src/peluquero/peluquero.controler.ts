import { Request, Response, NextFunction, response } from "express"
import { PeluqueroRepository } from "./peluquero.repository.js"
import { Peluquero } from "./peluqueros.entity.js"

const repository = new PeluqueroRepository()

//Creamos una funcion que actue como un meddleware
function sanitizePeluqueroInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        codigo: req.body.codigo,
        fechaingreso: req.body.fechaingreso,
        tipo: req.body.tipo,
    }
    //Mas validaciones para la seguridad e integridad de los datos
    //Para quitar el elemento que no queremos:
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}

function findAll(req: Request, res:Response){
    res.json({data:repository.findAll() }); //Enviamos la lista de peluqueros como respuesta
}

function getOne(req:Request, res:Response){
    const codigo = parseInt(req.params.codigo, 10); // Convertimos req.params.codigo a número
    const peluquero = repository.getOne({codigo})
    if(!peluquero){
        return res.status(404).send({message: 'Peluquero no encontrado' }) 
    };
    res.json({data: peluquero});
};

//Debemos incluir un middleware para que forme req.body y pasar toda la informacion hacia el app.post
function add(req: Request, res:Response){
    //info disponible dentro de la req.body
    const input = req.body.sanitizedInput

    //Procedemos a crear nuestro nuevo peluquero con la nueva informacion.
    // elementos que recuperamos del body
    const peluqueroInput = new Peluquero(
        input.nombre,
        parseInt(input.codigo, 10), 
        new Date(input.fechaingreso),
        input.tipo)
    const peluquero = repository.add(peluqueroInput) //lo agregamos al contenido de nuestra coleccion
    return res.status(201).send({message: 'Peluquero Creado', data: peluquero}); //Este states indica que se creo' el recurso.
};

function update(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10); // Convertir el parámetro codigo a número
    const input = req.body.sanitizedInput
    input.codigo = codigo
    const peluquero = repository.update(input)

    if(!peluquero){ //no lo encontro
        return res.status(404).send({message: 'Peluquero no encontrado' })
    }
    return res.status(200).send({message:'Actualizacion exitosa', data: peluquero})
};

function remove(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const peluquero = repository.delete({codigo})

    if(!peluquero){
        res.status(404).send({message: 'Peluquero no encontrado' })
    } else{
    res.status(200).send({message: 'Peluquero borrado exitosamente'})
    }
};

export {sanitizePeluqueroInput, findAll, getOne, add, update, remove}