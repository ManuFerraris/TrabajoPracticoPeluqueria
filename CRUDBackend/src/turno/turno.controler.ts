import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Turno } from "./turno.entity.js";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
//import { Servicio } from "../Servicio/servicio.entity.js";

const em = orm.em

function sanitizeTurnoInput(req: Request, res: Response, next:NextFunction){
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        codigo_peluquero:req.body.codigo_peluquero,
        codigo_cliente:req.body.codigo_cliente,
        //codigo_servicio: req.body.codigo_servicio,
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

//Funciones para validar:
//----------------------//

function validaFecha_hora(fecha_hora:string){
    const fechaHoy = new Date().toISOString().split('T')[0];
    if(fecha_hora < fechaHoy){
        return false;
    }else {
        return true;
    }
};

function validaTipo_turno(tipo_turno:string){
    if(tipo_turno != 'Sucursal' && tipo_turno != 'A Domicilio'){
        return false;
    }else {
        return true;
    }
};

function validaPorcentaje(porcentaje:number){
    if(porcentaje < 0 || porcentaje > 100){
        return false;
    }else{
        return true;
    }
}

function validaEstado(estado:string){
    if(estado != 'Activo' && estado != 'Cancelado' && estado != 'Sancionado'){
        return false;
    }else{
        return true;
    }
}

async function findAll(req:Request, res:Response){ //FUNCIONAL
    try{
        const turno = await em.find(Turno, {}, { populate: ['cliente', 'peluquero', 'servicio']})
        if(!turno){
            return res.status(404).json({message: 'No hay turnos cargados'})
        }
        return res.status(200).json({message:'Todos los turnos encontados', data: turno})
    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
}

async function getOne(req: Request, res:Response ){ //FUNCIONAL
    try{
        const codigo_turno = Number(req.params.codigo_turno.trim())
        if (isNaN(codigo_turno)) {
            return res.status(400).json({ message: 'Código de turno inválido' });
        }
        const turno = await em.findOne(Turno, {codigo_turno}, { populate: ['cliente', 'peluquero', 'servicio'] })
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }
        return res.status(200).json({message:'Turno encontrado', data:turno})
    }catch(error:any){
        return res.status(500).json({ message: error.message })
    }
}

async function add(req: Request, res:Response){ //FUNCIONAL
    try{
        // Extraemos los códigos de cliente y peluquero del cuerpo de la solicitud
        const { codigo_cliente, codigo_peluquero, /*codigo_servicio*/ fecha_hora, tipo_turno, porcentaje, estado } = req.body;

        // Verificamos si el cliente y el peluquero existen
        const cod_cli = Number(codigo_cliente);
        if(isNaN(cod_cli)){
            return res.status(404).json({ message: 'El codigo de cliente es invalido'})
        };
        const cliente = await em.findOne(Cliente, { codigo_cliente:cod_cli });

        const cod_pel = Number(codigo_peluquero);
        if(isNaN(cod_pel)){
            return res.status(404).json({ message: 'El codigo de peluquero es invalido'})
        };
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero:cod_pel });

        if(!cliente){
            return res.status(400).json({ message: 'El cliente no existe'})
        };
        if(!peluquero){
            return res.status(400).json({ message: 'El peluquero no existe'})
        };

        //VALIDACIONES//

        if(!validaFecha_hora(fecha_hora)){
            return res.status(400).json({ message: 'La fecha y hora no pueden ser menores a la actual'})
        };

        if(!validaTipo_turno(tipo_turno)){
            return res.status(400).json({ message: 'El tipo de turno debe ser "Sucursal" o "A domicilio"'})
        };

        if(!validaPorcentaje(porcentaje)){
            return res.status(400).json({ message: 'El porcentaje debe estar entre 0 y 100'})
        };

        if(!validaEstado(estado)){
            return res.status(400).json({ message: 'El estado debe ser "Activo" o "Cancelado"'})
        };

        //Creacion del turno
        const turno = new Turno()
        turno.cliente = cliente;
        turno.peluquero = peluquero;
        turno.fecha_hora = fecha_hora;
        turno.tipo_turno = tipo_turno;
        turno.estado = estado;
        if(turno.tipo_turno === 'A Domicilio'){
            turno.porcentaje = 25
        } else {
            turno.porcentaje = 0
        };
        await em.persistAndFlush(turno)

        return res.status(201).json({ message: 'Turno creado', data:turno})
    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
}

async function update(req: Request, res: Response){
    try{
        const codigo_turno = Number(req.params.codigo_turno)
        if (isNaN(codigo_turno)) {
            return res.status(400).json({ message: 'Código de turno inválido' });
        }
        const turnoAActualizar = await em.findOne(Turno, {codigo_turno})
        if (!turnoAActualizar) {
            return res.status(404).json({ message: 'El turno no existe' });
        }
        // Verificar si sanitizedInput existe
        if (!req.body.sanitizedInput) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        };

        const { codigo_cliente, codigo_peluquero, /*codigo_servicio*/ fecha_hora, tipo_turno, porcentaje, estado } = req.body.sanitizedInput;

        //VALIDACIONES//

        if(!validaFecha_hora(fecha_hora)){
            return res.status(400).json({ message: 'La fecha y hora no pueden ser menores a la actual'})
        };

        if(!validaTipo_turno(tipo_turno)){
            return res.status(400).json({ message: 'El tipo de turno debe ser "Sucursal" o "A domicilio"'})
        };

        if(!validaPorcentaje(porcentaje)){
            return res.status(400).json({ message: 'El porcentaje debe estar entre 0 y 100'})
        };

        if(!validaEstado(estado)){
            return res.status(400).json({ message: 'El estado debe ser "Activo" / "Cancelado" o "Sancionado"'})
        };

        // Verificar si el código del cliente existe
        const cod_cli = Number(codigo_cliente);
        if(isNaN(cod_cli)){
            return res.status(404).json({ message: 'El codigo de cliente es invalido'})
        };
        const cliente = await em.findOne(Cliente, { codigo_cliente:cod_cli });
        if (!cliente) {
            return res.status(404).json({ message: 'El código del cliente no existe' });
        }
        

        // Verificar si el código del peluquero existe
        const cod_pel = Number(codigo_peluquero);
        if(isNaN(cod_pel)){
            return res.status(404).json({ message: 'El codigo de peluquero es invalido'})
        };

        const peluquero = await em.findOne(Peluquero, { codigo_peluquero:cod_pel });
        if (!peluquero) {
            return res.status(404).json({ message: 'El código del peluquero no existe' });
        }
        

        turnoAActualizar.cliente = cliente;
        turnoAActualizar.peluquero = peluquero;

        em.assign(turnoAActualizar, req.body.sanitizedInput)
        await em.flush()
        return res.status(200).json({ message:'Turno actualizado correctamente', data:turnoAActualizar})

    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
}

async function remove(req: Request, res: Response){
    try{
        const codigo_turno = Number(req.params.codigo_turno.trim())
        if (isNaN(codigo_turno)) {
            return res.status(400).json({ message: 'Código de turno inválido' });
        }
        const turno = await em.findOne(Turno, { codigo_turno }, { populate: ['servicio'] });
        if (!turno){
            return res.status(404).json({ message: 'El turno no existe' });
        }
        // Eliminar el servicio asociado antes de eliminar el turno
        if (turno.servicio) {
            await em.removeAndFlush(turno.servicio); // Eliminar el servicio primero
        }
        await em.removeAndFlush(turno)
        return res.status(200).json({ message: 'Turno eliminado exitosamente' })
    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
}
export {findAll, getOne, add, update, remove, sanitizeTurnoInput}