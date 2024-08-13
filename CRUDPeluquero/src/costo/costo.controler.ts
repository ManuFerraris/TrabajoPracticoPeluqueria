import { Request, Response, NextFunction } from "express";
import { CostoRepository } from "./costo.repository.js"; 
import { Costo } from "./costo.entity.js";

const repository = new CostoRepository()

function sanitizeCostoInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        codigo_turno: req.body.codigo_turno,
        monto: req.body.monto,
        estado: req.body.estado,
        adicional_adom: req.body.adicional_adom,
        ausencia_cliente: req.body.ausencia_cliente,
        medio_pago: req.body.medio_pago,
    }
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
    const codigo = parseInt(req.params.codigo, 10);
    const costo = await repository.getOne({codigo})
    if(!costo){
        return res.status(404).send({message: 'Costo no encontrado' }) 
    };
    res.json({data: costo});
};

async function add(req: Request, res:Response){
    try {
        const input = req.body.sanitizedInput;

        const costoInput = new Costo(
            parseInt(input.codigo, 10),
            parseInt(input.codigo_turno, 10),
            input.monto,
            input.estado,
            input.adicional_adom,
            input.ausencia_cliente,
            input.medio_pago
        );

        const costo = await repository.add(costoInput);
        return res.status(201).send({ message: 'Costo Creado', data: costo });
    } catch (error) {
        if (error instanceof Error) {
            // Maneja el error de manera apropiada
            if (error.message === 'El turno no existe') {
                return res.status(400).send({ message: error.message });
            } else {
                return res.status(500).send({ message: 'Error interno del servidor', error: error.message });
            }
        }
        return res.status(500).send({ message: 'Error desconocido' });
    }
};

async function update(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10); 
    const input = req.body.sanitizedInput;
    input.codigo = codigo;
    try {
        const costo = await repository.update(input);

        if (!costo) {
            return res.status(404).send({message: 'Costo no encontrado o turno no existe' });
        }
        return res.status(200).send({message:'Actualización exitosa', data: costo});
    } catch (error) {
        return res.status(500).send({message: 'Error al actualizar el costo', error: (error as Error).message });
    }
};

async function remove(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    try {
        const costo = await repository.delete({ codigo });

        if (!costo) {
            return res.status(404).send({ message: 'Costo no encontrado' });
        }
        return res.status(200).send({ message: 'Costo borrado exitosamente' });
    } catch (error: any) {
        // Manejar los errores generados por el repositorio
        return res.status(500).send({ message: 'Error al eliminar el costo', error: error.message });
    }
};

export {sanitizeCostoInput, findAll, getOne, add, update, remove}