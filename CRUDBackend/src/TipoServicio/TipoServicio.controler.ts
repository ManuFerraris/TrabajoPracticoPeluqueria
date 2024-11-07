import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { TipoServicio } from "./tiposervicio.entity.js";

const em = orm.em;

function sanitizeTipoServicioInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        duracion_estimada: req.body.duracion_estimada,
        precio_base: req.body.precio_base
    };

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}

async function findAll(req: Request, res: Response) {
    try {
        const tiposServicios = await em.find(TipoServicio, {}, {populate: ['servicio']});
        return res.status(200).json({ message: 'Todos los tipos de servicios encontrados', data: tiposServicios });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    };
};

async function getOne(req: Request, res: Response) {
        try {
        const { codigo_tipo } = req.params;

        // Verificar si el código de tipo de servicio es proporcionado
        if (!codigo_tipo) {
            return res.status(400).json({ message: 'Código de tipo de servicio es requerido' });
        }

        const tipoServicio = await em.findOne(TipoServicio, { codigo_tipo: Number(codigo_tipo) });

        // Verificar si se encontró el tipo de servicio
        if (!tipoServicio) {
            return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        }

        return res.status(200).json({ data: tipoServicio });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
};

async function add(req: Request, res: Response) {
    try {
        const { nombre, descripcion, duracion_estimada, precio_base } = req.body.sanitizedInput;

        // Crear un nuevo TipoServicio sin el campo 'codigo_tipo' ya que es auto-incremental
        const tipoServicio = new TipoServicio();
        tipoServicio.nombre = nombre;
        tipoServicio.descripcion = descripcion;
        tipoServicio.duracion_estimada = duracion_estimada;
        tipoServicio.precio_base = precio_base;

        await em.persistAndFlush(tipoServicio); // Usa persistAndFlush en lugar de flush

        return res.status(201).json({ message: 'Tipo de servicio creado', data: tipoServicio });
    } catch (error: any) {
        console.error('Error en add:', error); // Depuración
        return res.status(500).json({ message: error.message });
    }
}

async function update(req: Request, res: Response) {
    try {
        const codigo_tipo = Number(req.params.codigo_tipo);
        if (isNaN(codigo_tipo)) {
            return res.status(400).json({ message: 'Código de tipo de servicio inválido' });
        }

        const tipoServicio = await em.findOne(TipoServicio, { codigo_tipo });
        if (!tipoServicio) {
            return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        }

        const { nombre, descripcion, duracion_estimada, precio_base } = req.body.sanitizedInput;

        // Actualizar los demás campos
        em.assign(tipoServicio, { nombre, descripcion, duracion_estimada, precio_base });
        await em.flush();

        return res.status(200).json({ message: 'Tipo de servicio actualizado correctamente', data: tipoServicio });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

async function remove(req: Request, res: Response) {
    try {
        const codigo_tipo = Number(req.params.codigo_tipo);
        if (isNaN(codigo_tipo)) {
            return res.status(400).json({ message: 'Código de tipo de servicio inválido' });
        }

        const tipoServicio = await em.findOne(TipoServicio, { codigo_tipo });
        if (!tipoServicio) {
            return res.status(404).json({ message: 'Tipo de servicio no encontrado' });
        }

        await em.removeAndFlush(tipoServicio);
        return res.status(200).json({ message: 'Tipo de servicio eliminado exitosamente' });
    } catch (error: any) {
        return res.status(500).json({ message: error.message });
    }
}

export { findAll, getOne, add, update, remove, sanitizeTipoServicioInput };