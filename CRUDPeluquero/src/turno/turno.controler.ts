import { Request, Response, NextFunction} from "express";
import { TurnoRepository } from "./turno.repository.js";
import { Turno } from "./turno.entity.js";
import { PeluqueroRepository } from "../peluquero/peluquero.repository.js";
import { ClienteRepository } from "../cliente/cliente.repository.js";

const repository = new TurnoRepository()
const peluqueroRepository = new PeluqueroRepository() //Instanciar el repositorio peluquero
const clienteRepository = new ClienteRepository()     //Instanciar el repositorio cliente


function sanitizeTurnoInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        codigo_peluquero:req.body.codigo_peluquero,
        codigo_cliente:req.body.codigo_cliente,
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

async function findAll(req:Request, res:Response){
    res.json({data:await repository.findAll() })
};

async function getOne(req: Request, res:Response ){
    const codigo = parseInt(req.params.codigo, 10);
    const turno = await repository.getOne({codigo})
    if(!turno){
        return res.status(404).send({message: 'Turno no encontrado' }) 
    };
    res.json({data: turno});
};

async function add(req: Request, res:Response){
    const input = req.body.sanitizedInput

    // Validar la existencia del peluquero
    const cod_pel = parseInt(input.codigo_peluquero, 10)
    const peluqueroExistente = await peluqueroRepository.getOne({ codigo: cod_pel });
    if (!peluqueroExistente) {
        return res.status(404).send({ message: 'Peluquero no encontrado' });
    }

    // Validar la existencia del cliente
    const cod_cli =parseInt(input.codigo_cliente, 10)
    const clienteExistente = await clienteRepository.getOne({ codigo: cod_cli });
    if (!clienteExistente) {
        return res.status(404).send({ message: 'Cliente no encontrado' });
    }

    // Validar el formato de la fecha
    const fechaHora = new Date(input.fecha_hora);
    if (isNaN(fechaHora.getTime())) {
        return res.status(400).send({ message: 'Formato de fecha no válido' });
    }
    // Convertir la fecha al formato YYYY-MM-DD HH:MM:SS
    const fechaHoraFormateada = fechaHora.toISOString().slice(0, 19).replace('T', ' ');

    const turnoInput = new Turno(
        parseInt(input.codigo, 10),
        parseInt(input.codigo_peluquero, 10),
        parseInt(input.codigo_cliente, 10),
        fechaHoraFormateada,
        input.tipo_turno,
        input.porcentaje,
        input.estado
    )
    const turno = await repository.add(turnoInput)
    return res.status(201).send({message: 'Turno Creado', data: turno});
};

async function update(req: Request, res: Response){
    try {
        const codigo = parseInt(req.params.codigo, 10);
        const input = req.body.sanitizedInput;
        input.codigo = codigo;
        const turno = await repository.update(input); // Llamar al método update en el repositorio

        if (!turno) { // No se encontró el turno para actualizar
            return res.status(404).send({ message: 'Turno no encontrado' });
        }

        // Devolver respuesta exitosa
        return res.status(200).send({ message: 'Actualización exitosa', data: turno });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error al actualizar el turno:', error.message);
            return res.status(400).send({ message: error.message });
        } else {
            console.error('Error inesperado al actualizar el turno:', error);
            return res.status(500).send({ message: 'Error inesperado' });
        }
    }
};

async function remove(req: Request, res: Response){
    const codigo = parseInt(req.params.codigo, 10);
    const turno = await repository.delete({codigo})

    if(!turno){
        res.status(404).send({message: 'Turno no encontrado' })
    } else{
    res.status(200).send({message: 'Turno borrado exitosamente'})
    }
};

export {sanitizeTurnoInput, findAll, getOne, add, update, remove}