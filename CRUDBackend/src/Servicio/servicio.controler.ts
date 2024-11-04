import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Servicio } from "./servicio.entity.js";
import { Turno } from "../turno/turno.entity.js";

const em = orm.em;

function sanitizeServicioInput(req: Request, res: Response, next: NextFunction) {
    /*if (!req.body) { return res.status(400).json({ message: 'No se proporcionaron datos en el cuerpo de la solicitud' }); }*/
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        monto: req.body.monto,
        estado: req.body.estado,
        adicional_adom: req.body.adicional_adom,
        ausencia_cliente: req.body.ausencia_cliente,
        medio_pago: req.body.medio_pago,
        turno_codigo_turno: req.body.turno_codigo_turno
    };

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });

    //console.log('Datos sanitizados:', req.body.sanitizedInput); // Para verificar los datos sanitizados
    next();
}

//Funciones para validar:
//----------------------//

function validaMonto (monto: number){
    if (monto < 0){
        return false;
    }
    return true;
};

function validaEstado(estado:string){
    if (estado != 'Pendiente' && estado != 'Pago'){
        return false;
    }
    return true;
};

function validaAdicionalAdom(adicional_adom:number){
    if (adicional_adom < 0){
        return false;
    }
    return true;
}

function validaAusenciaCliente(ausencia_cliente:string){
    if (ausencia_cliente != 'Se presento' && ausencia_cliente != 'Esta ausente'){
        return false;
    }
    return true;
};

function validaMedioDePago(medio_pago:string){
    if (medio_pago != 'Mercado Pago' && medio_pago != 'Efectivo'){
        return false;
    }
    return true;
};

async function findAll(req: Request, res: Response) {
    try {
        const servicios = await em.find(Servicio, {});
        res.status(200).json({ message: 'Todos los servicios encontrados', data: servicios });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function getOne(req: Request, res: Response) {
    try {
        const codigo = Number.parseInt(req.params.codigo);
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        }
        const servicio = await em.findOne(Servicio, { codigo });
        if (servicio) {
            res.status(200).json({ message: 'Servicio encontrado', data: servicio });
        } else {
            res.status(404).json({ message: 'Servicio no encontrado' });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function add(req: Request, res: Response) {
    try {
        const { monto, estado, adicional_adom, ausencia_cliente, medio_pago, turno_codigo_turno } = req.body.sanitizedInput;
        if (!turno_codigo_turno) {
            return res.status(400).json({ message: 'Código de turno no proporcionado' });
        }
        
        // Verificar si el turno existe en la base de datos
        const turno = await em.findOne(Turno, { codigo_turno: turno_codigo_turno });
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado' });
        }

        // Verificar si el turno ya tiene un servicio asociado
        if (turno.servicio) {
            return res.status(400).json({ message: 'El turno ya tiene un servicio asociado' });
        }

        //VALIDACIONES//
        //************//

        if(!validaMonto(monto)){
            return res.status(400).json({ message: 'El monto no puede ser menor a 0.'})
        };

        if(!validaEstado(estado)){
            return res.status(400).json({ message: 'El estado debe ser Pendiente o Pagado'})
        };

        if(!validaAdicionalAdom(adicional_adom)){
            return res.status(400).json({ message: 'El adicional a domicilio no debe ser menor que 0'})
        };

        if(!validaAusenciaCliente(ausencia_cliente)){
            return res.status(400).json({ message: 'Las opciones validas son: "Se presento" o "Esta ausente"'})
        };

        if(!validaMedioDePago(medio_pago)){
            return res.status(400).json({ message: 'Las opciones validas son "Efectivo" o "Mercado pago"'})
        };

        
        // Crear el servicio
        const servicio = new Servicio();
        servicio.monto = monto;
        servicio.estado = estado;
        servicio.adicional_adom = adicional_adom;
        servicio.ausencia_cliente = ausencia_cliente;
        servicio.medio_pago = medio_pago;
        servicio.turno = turno; // Asociar el turno al servicio

        // Persistir el servicio en la base de datos
        await em.persistAndFlush(servicio);

        // Asociar el servicio al turno
        turno.servicio = servicio;
        await em.persistAndFlush(turno);

        res.status(201).json({ message: 'Servicio creado', data: servicio });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

async function update(req: Request, res: Response) {
    try {
        const codigo = Number(req.params.codigo);
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        }

        const servicioAActualizar = await em.findOne(Servicio, { codigo });
        if (!servicioAActualizar) {
            return res.status(404).json({ message: 'El servicio no existe' });
        }

        // Verificar si sanitizedInput existe
        if (!req.body.sanitizedInput) {
            return res.status(400).json({ message: 'No hay datos para actualizar' });
        }

        const { monto, estado, adicional_adom, ausencia_cliente, medio_pago, turno_codigo_turno } = req.body.sanitizedInput;

        //VALIDACIONES//
        //************//

        if(!validaMonto(monto)){
            return res.status(400).json({ message: 'El monto no puede ser menor a 0.'})
        };

        if(!validaEstado(estado)){
            return res.status(400).json({ message: 'El estado debe ser Pendiente o Pagado'})
        };

        if(!validaAdicionalAdom(adicional_adom)){
            return res.status(400).json({ message: 'El adicional a domicilio no debe ser menor que 0'})
        };

        if(!validaAusenciaCliente(ausencia_cliente)){
            return res.status(400).json({ message: 'Las opciones validas son: "Se presento" o "Esta ausente"'})
        };

        if(!validaMedioDePago(medio_pago)){
            return res.status(400).json({ message: 'Las opciones validas son "Efectivo" o "Mercado pago"'})
        };

        // Validacion del codigo de turno
        if (turno_codigo_turno !== undefined) {
            const nuevoTurno = await em.findOne(Turno, { codigo_turno: turno_codigo_turno });
            if (!nuevoTurno) {
                return res.status(404).json({ message: 'El código del turno no existe' });
            }

            // Verificar si el nuevo turno ya tiene un servicio asociado
            const servicioExistente = await em.findOne(Servicio, { turno: nuevoTurno });
            if (servicioExistente && servicioExistente.codigo !== servicioAActualizar.codigo) {
                return res.status(400).json({
                    message: 'Conflicto de clave única',
                    error: 'El turno ya tiene un servicio asociado. Por favor, elige otro turno o elimina el servicio existente.'
                });
            }

            // Actualizar el turno en la entidad Servicio
            servicioAActualizar.turno = nuevoTurno;
        }

        // Actualizar los demás campos
        em.assign(servicioAActualizar, req.body.sanitizedInput);
        await em.flush();

        res.status(200).json({ message: 'Servicio actualizado correctamente', data: servicioAActualizar });
    } catch (error: any) {
        // Manejar el error de clave única de MySQL
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                message: 'Conflicto de clave única',
                error: 'El turno ya está asociado a otro servicio. Por favor, elige otro turno o elimina el servicio existente.'
            });
        }
        res.status(500).json({ message: error.message });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const codigo = Number.parseInt(req.params.codigo);
        if (isNaN(codigo)) {
            return res.status(400).json({ message: 'Código de servicio inválido' });
        }
        const servicio = await em.findOne(Servicio, { codigo });
        if (!servicio) {
            return res.status(404).json({ message: 'El servicio no existe' });
        }
        const turno = await em.find(Turno, { servicio });
        if( turno.length > 0){
            return res.status(404).json({ message: 'El servicio esta asociado a un turno' });
        }
        // Eliminar el servicio de la base de datos
        await em.removeAndFlush(servicio);
        res.status(200).json({ message: 'Servicio eliminado exitosamente' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

export { sanitizeServicioInput, findAll, getOne, add, update, remove };
