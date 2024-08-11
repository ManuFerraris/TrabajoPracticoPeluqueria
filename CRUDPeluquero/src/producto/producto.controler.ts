import { Request, Response, NextFunction } from "express";
import { ProductoRepository } from "./producto.repository.js";
import { Producto } from "./productos.entity.js";

const repository = new ProductoRepository()

async function sanitizeProductoInput(req:Request, res:Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        nombre: req.body.nombre,
        stock: req.body.stock
    }
    Object.keys(req.body.sanitizedInput).forEach(key => {
        if(req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key]}
    })
    next()
}

async function findAll(req: Request, res:Response){
    res.json({data: await repository.findAll() });
}

async function getOne(req:Request, res:Response){
    const codigo = parseInt(req.params.codigo, 10);
    const producto = await repository.getOne({codigo})
    if(!producto){
        return res.status(404).send({message: 'Producto no encontrado' }) 
    };
    res.json({data: producto});
};

async function add(req: Request, res:Response){
    const input = req.body.sanitizedInput

    const productoInput = new Producto(
        
        parseInt(input.codigo, 10),
        input.nombre, 
        input.stock)
    const producto = await repository.add(productoInput) 
    return res.status(201).send({message: 'Producto Creado', data: producto});
};

async function update(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const input = req.body.sanitizedInput
    input.codigo = codigo
    const producto = await repository.update(input)

    if(!producto){
        return res.status(404).send({message: 'Producto no encontrado' })
    }
    return res.status(200).send({message:'Actualizacion exitosa', data: producto})
};

async function remove(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const producto = await repository.delete({codigo})

    if(!producto){
        res.status(404).send({message: 'Producto no encontrado' })
    } else{
    res.status(200).send({message: 'Producto borrado exitosamente'})
    }
};

export {sanitizeProductoInput, findAll, getOne, add, update, remove}