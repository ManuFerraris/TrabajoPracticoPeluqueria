import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Pago } from "./pago.entity.js";
import { Turno } from "../turno/turno.entity.js";

const em = orm.em;

// Middleware para sanitizar la entrada
function sanitizePagoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        monto: req.body.monto,
        estado: req.body.estado,
        metodo: req.body.metodo,  // corregido de metodo_pago a metodo
        fecha: req.body.fecha,
        turno_codigo_turno: req.body.turno_codigo_turno,
    };

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });

    next();
}

// Validaciones
function validaMonto(monto: number) {
    return monto >= 0;
}

function validaEstado(estado: string) {
    return estado === 'Pendiente' || estado === 'Pagado';
}

function validaMetodo(metodo: string) {
    return metodo === 'Efectivo' || metodo === 'Mercado Pago';
}

// Obtener todos los pagos y con su turno asociado
async function findAll(req: Request, res: Response) {
  try {
    // Trae todos los pagos junto con su turno asociado
    const pagos = await em.find(Pago, {}, { populate: ['turno'] });

    // Responde con el array de pagos y un mensaje
    return res.status(200).json({
      message: 'Todos los pagos encontrados',
      data: pagos
    });
  } catch (error: any) {
    // En caso de error, responde con status 500 y el mensaje del error
    return res.status(500).json({ message: error.message });
  }
}

// Obtener un pago por ID
async function getOne(req: Request, res: Response) {
    try {
        const id = Number(req.params.id); // corregido de codigo a id
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de pago inválido' });
        }

        const pago = await em.findOne(Pago, { id }); // corregido
        if (pago) {
            return res.status(200).json({ message: 'Pago encontrado', data: pago });
        } else {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Crear un nuevo pago
async function add(req: Request, res: Response) {
    try {
        const { monto, estado, metodo, fecha, turno_codigo_turno } = req.body.sanitizedInput;

        if (!turno_codigo_turno) {
            return res.status(400).json({ message: 'Código de turno no proporcionado.' });
        }

        const cod_tur = Number(turno_codigo_turno);
        if (isNaN(cod_tur)) {
            return res.status(400).json({ message: 'Código de turno inválido.' });
        }

        const turno = await em.findOne(Turno, { codigo_turno: cod_tur });
        if (!turno) {
            return res.status(404).json({ message: 'Turno no encontrado.' });
        }

        if (!validaMonto(monto)) {
            return res.status(400).json({ message: 'El monto no puede ser menor a 0.' });
        }

        if (!validaEstado(estado)) {
            return res.status(400).json({ message: 'El estado debe ser Pendiente o Pagado.' });
        }

        if (!validaMetodo(metodo)) {
            return res.status(400).json({ message: 'Las opciones válidas son "Efectivo" o "Mercado Pago".' });
        }
        // Validar si ya existe un pago para ese turno
        const pagoExistente = await em.findOne(Pago, { turno });

        if (pagoExistente) {
        return res.status(400).json({ message: 'Ya existe un pago para ese turno' });
        }


        const pago = new Pago();
        pago.monto = monto;
        pago.estado = estado;
        pago.metodo = metodo;  // corregido
        pago.fecha = fecha ? new Date(fecha) : new Date();
        pago.turno = turno;

        await em.persistAndFlush(pago);

        return res.status(201).json({ message: 'Pago creado', data: pago });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Actualizar un pago
async function update(req: Request, res: Response) {
    try {
        const id = Number(req.params.id); 
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de pago inválido' });
        }

        const pagoAActualizar = await em.findOne(Pago, { id }); 
        if (!pagoAActualizar) {
            return res.status(404).json({ message: 'El pago no existe' });
        }

        const { monto, estado, metodo, fecha, turno_codigo_turno } = req.body.sanitizedInput;

        if (monto !== undefined && !validaMonto(monto)) {
            return res.status(400).json({ message: 'El monto no puede ser menor a 0.' });
        }

        if (estado !== undefined && !validaEstado(estado)) {
            return res.status(400).json({ message: 'El estado debe ser Pendiente o Pagado.' });
        }

        if (metodo !== undefined && !validaMetodo(metodo)) {
            return res.status(400).json({ message: 'Las opciones válidas son "Efectivo" o "Mercado Pago".' });
        }

        if (turno_codigo_turno !== undefined) {
            const cod_tur = Number(turno_codigo_turno);
            if (isNaN(cod_tur)) {
                return res.status(400).json({ message: 'Código de turno inválido.' });
            }

            const turno = await em.findOne(Turno, { codigo_turno: cod_tur });
            if (!turno) {
                return res.status(404).json({ message: 'Turno no encontrado.' });
            }

            pagoAActualizar.turno = turno;
        }

        em.assign(pagoAActualizar, req.body.sanitizedInput);
        await em.flush();

        return res.status(200).json({ message: 'Pago actualizado correctamente', data: pagoAActualizar });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

// Eliminar un pago
async function remove(req: Request, res: Response) {
    try {
        const id = Number(req.params.id); 
        if (isNaN(id)) {
            return res.status(400).json({ message: 'ID de pago inválido' });
        }

        const pago = await em.findOne(Pago, { id }); 
        if (!pago) {
            return res.status(404).json({ message: 'El pago no existe' });
        }

        await em.removeAndFlush(pago);
        return res.status(200).json({ message: 'Pago eliminado exitosamente' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

export { sanitizePagoInput, findAll, getOne, add, update, remove };
