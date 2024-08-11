import { Request, Response, NextFunction} from "express";
import { TurnoRepository } from "./turno.repository.js";
import { Turno } from "./turno.entity.js";

const repository = new TurnoRepository()

function sanitizeTurnoInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        fecha_hora: req.body.fecha_hora,
        tipo_turno: req.body.tipo_turno,
        porcentaje: req.body.porcentaje,
        estado: req.body.estado
    }
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
    const codigo = parseInt(req.params.codigo, 10);
    const turno = repository.getOne({codigo})
    if(!turno){
        return res.status(404).send({message: 'Turno no encontrado' }) 
    };
    res.json({data: turno});
};

function add(req: Request, res:Response){
    const input = req.body.sanitizedInput
    const turnoInput = new Turno(
        parseInt(input.codigo, 10),
        input.fecha_hora,
        input.tipo_turno,
        input.porcentaje,
        input.estado
    )
    const turno = repository.add(turnoInput)
    return res.status(201).send({message: 'Turno Creado', data: turno});
};

function update(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const input = req.body.sanitizedInput
    input.codigo = codigo
    const turno = repository.update(input)

    if(!turno){ //no lo encontro
        return res.status(404).send({message: 'Turno no encontrado' })
    }
    return res.status(200).send({message:'Actualizacion exitosa', data: turno})
};

function remove(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const turno = repository.delete({codigo})

    if(!turno){
        res.status(404).send({message: 'Turno no encontrado' })
    } else{
    res.status(200).send({message: 'Turno borrado exitosamente'})
    }
};

export {sanitizeTurnoInput, findAll, getOne, add, update, remove}