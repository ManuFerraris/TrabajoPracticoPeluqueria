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
        const cliente = await em.findOne(Cliente, { codigo_cliente });
        const peluquero = await em.findOne(Peluquero, { codigo_peluquero });
        /*const servicio = await em.findOne(Servicio, {codigo: codigo_servicio} )
        if(!servicio){
            return res.status(404).json({ message: 'El codigo del servicio no existe'})
        }*/
        if(!cliente){
            return res.status(400).json({ message: 'El codigo del cliente no existe'})
        }
        if(!peluquero){
            return res.status(400).json({ message: 'El codigo del peluquero no existe'})
        }

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
        }

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
        if (codigo_cliente) {
            const cliente = await em.findOne(Cliente, { codigo_cliente });
            if (!cliente) {
                return res.status(404).json({ message: 'El código del cliente no existe' });
            }
        };

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

        //Verificar si el codigo del servicio existe.
        /*if (codigo_servicio) {
            const servicio = await em.findOne(Servicio, { codigo: codigo_servicio });
            if (!servicio) {
                return res.status(404).json({ message: 'El código del servicio no existe' });
            }
        }*/

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