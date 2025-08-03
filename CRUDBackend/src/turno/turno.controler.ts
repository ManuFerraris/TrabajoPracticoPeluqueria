import { Request, Response, NextFunction } from "express";
//import { orm } from "../shared/db/orm.js";
import { Turno } from "./turno.entity.js";
import { Cliente } from "../cliente/clientes.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";
import { validarParametrosFiltrado } from "./funcionesTurno/validarparametrosFiltrados.js";
import { MikroORM, SqlEntityManager } from "@mikro-orm/mysql";

import { ListarTurnosFiltrados } from "../application/casos-uso/casosUsoTurno/ListarTurnosFiltrados.js";
import { ListarTurnosCanceladosPorMes } from "../application/casos-uso/casosUsoTurno/ListarTurnosCancelados.js";
import { TurnoRepositoryORM } from "../shared/db/TurnoRepositoryORM.js";
import { ListarTurnos } from "../application/casos-uso/casosUsoTurno/getAllTurnos.js";
import { BuscarTurno } from "../application/casos-uso/casosUsoTurno/BuscarTurno.js";
import { EliminarTurno } from "../application/casos-uso/casosUsoTurno/EliminarTurno.js";
import { ServicioRepositoryORM } from "../shared/db/ServicioRepositoryORM.js";

//const em = orm.em

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
/*
datejs
datefns
tempo
luxon 
*/
function validaFecha_hora(fecha_hora:string){
    const fechaHoy = new Date().toISOString().split('T')[0]; //
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

function validaHorarioLaboral(fechaHora: string) {
    const fechaTurno = new Date(fechaHora);
    const diaSemana = fechaTurno.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const hora = fechaTurno.getHours();
    const minutos = fechaTurno.getMinutes();

    // Domingos 
    if (diaSemana === 0) {
        return { valido: false, mensaje: "No se pueden agendar turnos los domingos." };
    }

    // Lunes a viernes
    if (diaSemana >= 1 && diaSemana <= 5) {
        if (hora < 8 || hora >= 20) {
            return { valido: false, mensaje: "El horario de atención es entre las 8:00hs y las 20:00hs." };
        }
    }

    // Sábados
    if (diaSemana === 6) {
        if (hora < 8 || (hora >= 12)) {
            return { valido: false, mensaje: "Los sábados, el horario de atención es entre las 8:00hs y las 12:00hs." };
        }
    }

    return { valido: true };
}

/*
async function validaTurnoUnicoPorDia(clienteId: number, fechaHora: string) {
    const cliente = await em.findOne(Cliente, { codigo_cliente: clienteId });

    if (!cliente) {
        throw new Error('Cliente no encontrado');
    }

    const fechaTurno = new Date(fechaHora);

    const inicioDelDia = new Date(fechaTurno);
    inicioDelDia.setHours(0, 0, 0, 0);

    const finDelDia = new Date(fechaTurno);
    finDelDia.setHours(23, 59, 59, 999);

    const turnosDelCliente = await em.find(Turno, {
        cliente: cliente
    });

    const turnoEnEseDia = turnosDelCliente.find(t => {
        const fechaTurnoExistente = new Date(t.fecha_hora);
        return fechaTurnoExistente >= inicioDelDia && fechaTurnoExistente <= finDelDia;
    });

    return turnoEnEseDia ? false : true;
}
*/


export const findAll = async (req:Request, res:Response): Promise<void> => { //FUNCIONAL
    try{
        const orm = (req.app.locals as {orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new ListarTurnos(repo);

        const turnos = await casouso.ejecutar();

        if(turnos.length === 0){
            res.status(400).json({ movimientos: [], message: 'No se encontraron turnos.' });
            return;
        };

        res.status(200).json(turnos);
        return;

    }catch(error:any){
        console.error('Error al buscar los turnos.',error);
        res.status(500).json({message: error.message})
        return;
    };
};

export const getOne = async (req: Request, res:Response ): Promise<void>=>{ //FUNCIONAL
    try{
        const {codigo_turno} = req.params;
        
        console.log("Codigo de turno", codigo_turno)
        if (!codigo_turno) {
            res.status(400).json({ message: 'Código de turno inválido' });
            return;
        };
        const codigoNumero = Number(codigo_turno);

        if(isNaN(codigoNumero)){
            res.status(400).json({ message: 'El código de turno debe ser un numero.' });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new BuscarTurno(repo);

        const turno = await casouso.ejecutar(codigoNumero);

        if(!turno){
            res.status(400).json({message: 'No se encontro el turno' });
            return;
        };

        res.status(200).json(turno);
        return;
    }catch(error:any){
        console.error('Error al buscar el turno.',error);
        res.status(500).json({ message: error.message });
        return;
    };
};

/*
async function add(req: Request, res:Response){ //FUNCIONAL
    try{
        // Extraemos los códigos de cliente y peluquero del cuerpo de la solicitud
        const { codigo_cliente, codigo_peluquero, fecha_hora, tipo_turno, porcentaje, estado } = req.body;

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

        // valido que el cliente no tenga ya un turno el mismo día
        const clientePuedeSacarTurno = await validaTurnoUnicoPorDia(cliente.codigo_cliente, fecha_hora);
        if (!clientePuedeSacarTurno) {
            return res.status(400).json({ message: 'El cliente ya tiene un turno agendado ese día.' });
        }


        // valido horario laboral
        const resultadoHorario = validaHorarioLaboral(fecha_hora);
        if (!resultadoHorario.valido) {
            return res.status(400).json({ message: resultadoHorario.mensaje });
        }

         // Validar que el peluquero no tenga ya un turno dentro de los 30 minutos anteriores o posteriores
         const fechaTurno = new Date(fecha_hora);
         const fechaInicio = new Date(fechaTurno.getTime() - 30 * 60000); // 30 min antes
         const fechaFin = new Date(fechaTurno.getTime() + 30 * 60000);   // 30 min después
 
         const turnoEnRango = await em.findOne(Turno, {peluquero,fecha_hora: {
                 $gte: fechaInicio.toISOString(),
                 $lte: fechaFin.toISOString()
             }
         });
 
         if (turnoEnRango) {
             return res.status(400).json({ message: 'El peluquero ya tiene un turno dentro de los 30 minutos del horario solicitado' });
         }
 

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
*/
/*
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

        const { codigo_cliente, codigo_peluquero, fecha_hora, tipo_turno, porcentaje, estado } = req.body.sanitizedInput;

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
        let peluqueroEntity: Peluquero | null = null;
        if (codigo_peluquero) {
            peluqueroEntity = await em.findOne(Peluquero, { codigo_peluquero });
            if (!peluqueroEntity) {
                return res.status(404).json({ message: 'El código del peluquero no existe' });
            }
        } else {
            peluqueroEntity = turnoAActualizar.peluquero;
        }

        // valido que el cliente no tenga dos turnos el mismo día 
        if (fecha_hora || codigo_cliente) {
            const clienteAValidar = codigo_cliente || turnoAActualizar.cliente.codigo_cliente;
            const fechaAValidar = fecha_hora || turnoAActualizar.fecha_hora;

            const fechaTurno = new Date(fechaAValidar);
            const inicioDelDia = new Date(fechaTurno);
            inicioDelDia.setHours(0, 0, 0, 0);

            const finDelDia = new Date(fechaTurno);
            finDelDia.setHours(23, 59, 59, 999);

            const turnosDelCliente = await em.find(Turno, {
                cliente: clienteAValidar
            });

            const otroTurno = turnosDelCliente.find(t => {
                const fechaTurnoExistente = new Date(t.fecha_hora);
                return fechaTurnoExistente >= inicioDelDia && fechaTurnoExistente <= finDelDia && t.codigo_turno !== codigo_turno;
            });

            if (otroTurno) {
                return res.status(400).json({ message: 'El cliente ya tiene un turno agendado ese día.' });
            }
        }   


        // validacion horario laboral
        if (fecha_hora) {
            const resultadoHorario = validaHorarioLaboral(fecha_hora);
            if (!resultadoHorario.valido) {
                return res.status(400).json({ message: resultadoHorario.mensaje });
            }
        }        

         // Validar que el peluquero no tenga otro turno en un rango de 30 minutos
         if (fecha_hora) {
            const fechaTurno = new Date(fecha_hora);
            const fechaInicio = new Date(fechaTurno.getTime() - 30 * 60000);
            const fechaFin = new Date(fechaTurno.getTime() + 30 * 60000);

            const otroTurno = await em.findOne(Turno, {
                peluquero: peluqueroEntity,fecha_hora: {
                    $gte: fechaInicio.toISOString(),
                    $lte: fechaFin.toISOString()
                },
                codigo_turno: { $ne: codigo_turno } // Excluir el mismo turno actual
            });

            if (otroTurno) {
                return res.status(400).json({ message: 'El peluquero ya tiene otro turno agendado dentro de los 30 minutos del horario solicitado' });
            }
        }
        
        turnoAActualizar.cliente = cliente;
        turnoAActualizar.peluquero = peluqueroEntity;

        em.assign(turnoAActualizar, req.body.sanitizedInput)
        await em.flush()
        return res.status(200).json({ message:'Turno actualizado correctamente', data:turnoAActualizar})

    }catch(error:any){
        return res.status(500).json({message: error.message})
    }
}
*/

export const remove = async (req: Request, res: Response):Promise<void> => {
    try{
        const {codigo_turno} = req.params;
        console.log("Codigo de turno", codigo_turno)

        if (!codigo_turno) {
            res.status(400).json({ message: 'Código de turno inválido' });
            return;
        };

        const codigoNumero = Number(codigo_turno);
        if(isNaN(codigoNumero)){
            res.status(400).json({ message: 'El código de turno debe ser un numero.' });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const turnoRepo = new TurnoRepositoryORM(em);
        const servicioRepo = new ServicioRepositoryORM(em);
        const casouso = new EliminarTurno(turnoRepo, servicioRepo);

        const errores = await casouso.ejecutar(codigoNumero);

        if (errores.length > 0){
            res.status(404).json({ message: 'El turno no existe' });
            return;
        };

        res.status(200).json({ message: 'Turno eliminado exitosamente' })
        return;

    }catch(error:any){
        console.error('Error al eliminar el turno.',error);
        res.status(500).json({message: error.message})
        return;
    }
}


export const listarTurnosFiltrados = async (req:Request, res:Response): Promise<void> => {
    try{
        const {mes} = req.query;
        
        if(!mes){
            res.status(400).json({ error: 'Falta el parametro \'mes\''});
            return;
        };

        const mesStr = req.query.mes?.toString() ?? '';

        const errores = validarParametrosFiltrado(mesStr);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0] });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casouso = new ListarTurnosFiltrados(repo);

        const turnos = await casouso.ejecutar(mes.toString());
        if(turnos.length === 0){
            res.status(404).json({ message: 'No se encontraron turnos filtrados' });
            return;
        };

        res.status(200).json(turnos);
        return;
    }catch(error){
        console.error('Error al listar turnos filtrados',error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    };
};

export const listarTurnosCanceladosPorMes = async(req: Request, res:Response): Promise<void> => {
    try{
        const {mes} = req.query;

        if(!mes){
            res.status(400).json({ error: 'Falta el parametro \'mes\''});
            return;
        };

        const mesStr = req.query.mes?.toString() ?? '';

        const errores = validarParametrosFiltrado(mesStr);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0] });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new TurnoRepositoryORM(em);
        const casoUso = new ListarTurnosCanceladosPorMes(repo);

        const turnosCancelados = await casoUso.ejecutar(mes.toString());

        if(turnosCancelados.length === 0){
            res.status(400).json({ message: 'No se encontraron turnos cancelados en dicho mes.'})
            return;
        };

        res.status(200).json(turnosCancelados);
        return;
    }catch(error){
        console.error('Error al listar turnos cancelados en dicho mes',error);
        res.status(500).json({ error: 'Error interno del servidor' });
        return;
    }
}

//export {findAll, getOne, add, update, remove, sanitizeTurnoInput}