import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Turno } from "../turno/turno.entity.js";
import { Peluquero } from "../peluquero/peluqueros.entity.js";

const em = orm.em

async function findAll(req:Request, res:Response){ //FUNCIONAL
    try{
        //Consultamos el codigo del peluquero enviado desde el BUSCADOR DE PELUQUEROS
        const codigo_peluquero = req.params.codigo_peluquero;
        console.log('codigo_peluquero:', codigo_peluquero);
        const cod_pel = Number(codigo_peluquero);
        console.log('cod_pel:', cod_pel)

        //Verificamos existencia de dicho codigo:
        if (cod_pel !== undefined && isNaN(cod_pel)) {
            return res.status(404).json({ message: 'Código de peluquero inválido' });
        };

        const peluquero = await em.findOne(Peluquero, { codigo_peluquero: cod_pel });
        if (!peluquero) {
            return res.status(404).json({ message: 'Peluquero no encontrado' });
        }

        //Filtramos:
        const filter: Record<string, any> = {};
        if (cod_pel) {
            filter.peluquero = { codigo_peluquero: cod_pel };
        };

        // Consultar la base de datos con el filtro
        const turnos = await em.find(Turno, filter, { populate: ['cliente', 'peluquero'] });

        if (!turnos) {
            return res.status(404).json({ message: 'No se encontraron turnos' });
        };

        return res.status(200).json({ message: 'Turnos encontrados', data: turnos });

        }catch(error:any){
        return res.status(500).json({message: error.message})
    };
};

export {findAll};