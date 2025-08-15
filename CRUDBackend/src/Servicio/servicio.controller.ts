import { Request, Response, NextFunction } from "express";
import { MikroORM } from "@mikro-orm/mysql";
import { ServicioRepositoryORM } from "../shared/db/ServicioRepositoryORM.js";
import { BuscarServicio } from "../application/casos-uso/casosUsoServicio/buscarServicio.js";
import { EliminarServicio } from "../application/casos-uso/casosUsoServicio/eliminarServicio.js";
import { validarParametrosFiltrado } from "../turno/funcionesTurno/validarparametrosFiltrados.js";
import { IngresosMensuales } from "../application/casos-uso/casosUsoServicio/IngresosMensuales.js";
import { ListarServicios } from "../application/casos-uso/casosUsoServicio/getAllServicios.js";
import { RegistrarServicio } from "../application/casos-uso/casosUsoServicio/RegistarServicio.js";
import { RegistrarServicioDTO, validarServicioDTO } from "../application/dtos/RegistrarServicioDTO.js";
import { ActualizarServicio } from "../application/casos-uso/casosUsoServicio/ActualizarServicio.js";
import { validarCodigo } from "../application/validarCodigo.js";
import { VerMiTurno } from "../application/casos-uso/casosUsoServicio/VerMiTurno.js";

/*function sanitizeServicioInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
        codigo: req.body.codigo,
        monto: req.body.monto,
        estado: req.body.estado,
        adicional_adom: req.body.adicional_adom,
        ausencia_cliente: req.body.ausencia_cliente,
        medio_pago: req.body.medio_pago,
        turno_codigo_turno: req.body.turno_codigo_turno,
        tipo_servicio_codigo: req.body.tipo_servicio_codigo,
        total: req.body.total,
    };

    Object.keys(req.body.sanitizedInput).forEach(key => {
        if (req.body.sanitizedInput[key] === undefined) {
            delete req.body.sanitizedInput[key];
        }
    });
    next();
}
*/

export const findAll = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new ListarServicios(repo);

        const servicios = await casouso.ejecutar();
        if(servicios.length === 0) {
            res.status(400).json({ message: 'No se encontraron servicios', data: servicios })
            return;
        };

        res.status(201).json({ message: 'Todos los servicios encontrados', data: servicios })
        return;
    }catch(error:any){
        console.error('Error al obtener los servicios.',error);
        res.status(500).json({message: error.message})
        return;
    }
};

export const getOne = async (req: Request, res: Response):Promise<void> => {
    try {
        const {codigo} = req.params;
        if(!codigo){
            res.status(400).json({ message: 'Código de servicio inválido' });
            return;
        };

        const codigoNumero = Number(codigo);
        if(isNaN(codigoNumero)){
            res.status(400).json({ message: 'El codigo debe ser un numero.' });
            return;
        };

        //const codigo = Number.parseInt(req.params.codigo);
        if (isNaN(codigoNumero)) {
            res.status(400).json({ message: 'Código de servicio inválido' });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new BuscarServicio(repo);

        const servicio = await casouso.ejecutar(codigoNumero);

        if(!servicio){
            res.status(400).json({message: 'No se encontro el Servicio' });
            return;
        };

        res.status(200).json(servicio);
        return;
    }catch(error:any){
        console.error('Error al obtener el servicio.',error);
        res.status(500).json({message: error.message})
        return;
    }
};

export const add = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new RegistrarServicio(repo);
        
        const dto: RegistrarServicioDTO = req.body;
        
        const errores = await validarServicioDTO(dto, em);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0], servicio: null });
            return;
        };
        
        const servicio = await casouso.ejecutar(dto, em);
        if (Array.isArray(servicio)) {
            res.status(400).json({ message: servicio[0], servicio: null });
            return;
        };

        res.status(201).json({ 
            message: 'Servicio registrado correctamente.',
            data: servicio
        });
        return;
    }catch(error:any){
        console.error('Error al crear el servicio.',error);
        res.status(500).json({message: error.message});
        return;
    };
};

export const update = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new ActualizarServicio(repo);
    
        const codServicio = Number(req.params.codigo);
        if (!codServicio || isNaN(codServicio)) {
            res.status(400).json({ message: 'El código de servicio es inválido o no fue provisto.' });
            return;
        };

        const dto = req.body;
        const actualizacion = true;
        const {errores, servicioActualizado} = await casouso.ejecutar(codServicio, dto, em, actualizacion);
        if(errores.length > 0 ){
            res.status(400).json({ message: errores[0] });
            return;
        };
    
        res.status(200).json({message:'Servicio actualizado correctamente', data:servicioActualizado});
        return;
    }catch(error:any){
        console.error('Error al actualizar el servicio.',error);
        res.status(500).json({ message: error.message });
        return;
    };
};

export const remove = async (req: Request, res: Response):Promise<void> => {
    try {
        const {valor: codSer, error:codError} = validarCodigo(req.params.codigo, 'codigo servicio');
        if(codError || codSer === undefined){
            res.status(404).json({ errores: codError });
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new EliminarServicio(repo);

        const errores = await casouso.ejecutar(codSer);

        if(errores.length > 0){
            const status = errores[0] === 'Servicio no encontrado.' ? 404 : 409; // 409 = Conflicto
            res.status(status).json({ message: errores[0] });
            return;
        };

        res.status(200).json({ message: 'Servicio eliminado exitosamente' });
        return;
    
    }catch(error:any){
        console.error('Error al eliminar el servicio.',error);
        res.status(500).json({message: error.message})
        return;
    };
};

export const ingresosMensuales = async (req:Request, res:Response):Promise<void> => {
    try{
        const { mes } = req.query;
        if(!mes){
            res.status(400).json({ messaje: 'No se ingreso ningun mes.'});
            return; 
        };

        const mesStr = req.query.mes?.toString() ?? '';
        const errores = validarParametrosFiltrado(mesStr);
        if(errores.length > 0){
            res.status(400).json({ message: errores[0] });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new IngresosMensuales(repo);

        const totalMes = await casouso.ejecutar(mes.toString());
        if(totalMes === 0){
            res.status(400).json({ message: 'No hubo facturacion en dicho mes.'})
            return;
        };

        res.status(200).json(totalMes);
        return;
    }catch(error:any){
        console.error('Error al calcular el total mensual.',error);
        res.status(500).json({ error: 'Error interno del servidor.' });
        return;
    }
};

export const verMiTurno = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor:codSer, error:codError} = validarCodigo(req.params.codigo, 'codigo servicio');
        if(codError || codSer === undefined){
            res.status(404).json({ erroes: codError});
            return;
        };

        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ServicioRepositoryORM(em);
        const casouso = new VerMiTurno(repo);

        const resultado = await casouso.ejecutar(codSer)
        if(typeof resultado === 'string'){
            res.status(404).json({ message: resultado, data: []});
            return;
        };

        const turno = resultado.turno;
        if(!turno){
            res.status(200).json({ message: 'El servicio no tiene un turno asignado.', data: turno });
            return;
        };

        res.status(200).json({ message: 'Turno del servicio encontrado.', data:turno});
        return;

    }catch(errores:any){
        console.error('Error al buscar el turno asociado al servicio.', errores);
        res.status(500).json({ message: 'Error interno del servidor.', errores });
        return;
    };
};