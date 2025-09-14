import { Request, Response } from "express";
import Stripe from 'stripe';
import PDFDocument from "pdfkit";
import { validarCodigo } from "../application/validarCodigo.js";
import { MikroORM } from "@mikro-orm/core";
import { PagoRepositoryORM } from "../shared/db/PagoRepositoryORM.js";
import { CrearPago } from "../application/casos-uso/casosUsoPago/CrearPago.js";
import { BuscarPago } from "../application/casos-uso/casosUsoPago/BuscarPago.js";
import { BuscarTodosLosPagos } from "../application/casos-uso/casosUsoPago/BuscarTodosLosPagos.js";
import { EliminarPago } from "../application/casos-uso/casosUsoPago/EliminarPago.js";
import { RegistrarPago } from "../application/casos-uso/casosUsoPago/RegistrarPago.js";
import { ActualizarPago } from "../application/casos-uso/casosUsoPago/ActualizarPago.js";
import { Pago } from "./pago.entity.js";
import { BuscarPagosCliente } from "../application/casos-uso/casosUsoPago/BuscarPagosCliente.js";
import { ClienteRepositoryORM } from "../shared/db/ClienteRepositoryORM.js";
import { buildReciboPDF } from "./crearRecibioPDF.js";

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Falta STRIPE_SECRET_KEY en las variables de entorno");
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-07-30.basil" });

// Cada crud tiene una funcion de validacion mas completa, por dicho motivo 
// dejamos de usar los sanitizeInput.

export const findAll = async (req: Request, res: Response):Promise<void> => {
    try{
        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const casouso = new BuscarTodosLosPagos(repo);

        const pagos = await casouso.ejecutar();
        if(pagos.length === 0){
            res.status(200).json({message: "No se encontraron pagos", data: pagos});
            return;
        };

        res.status(200).json({ message: "Pagos encontrados", data:pagos });
        return;
    }catch(error:any){
        console.error( "Error al buscar todos los pagos", error );
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    }
};

export const getOne = async (req: Request, res: Response):Promise<void> => {
    try{
        const {valor:codPago, error:codError} = validarCodigo(req.params.id, 'codigo de pago');
        if(codError || codPago === undefined){
            res.status(404).json({ message: codError });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const casouso = new BuscarPago(repo);
        
        const resultado = await casouso.ejecutar(codPago);
        if(typeof resultado === 'string'){
            res.status(404).json({ message: resultado });
            return;
        };

        res.status(200).json({message: 'Pago encontrado', data:resultado});
        return;

    }catch(error:any){
        console.error( "Error al buscar el pago", error );
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const add = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const casouso = new RegistrarPago(repo);

        const dto = req.body;

        const resultado = await casouso.ejecutar(dto, em);
        if(Array.isArray(resultado)){
            res.status(400).json({ errores: resultado });
            return;
        };

        res.status(201).json({ message: 'Pago creado con exito.', data: resultado });
        return;
    }catch(error:any){
        console.error( "Error al crear un pago", error );
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const update = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor:codPago, error:codError} = validarCodigo(req.params.id, 'codigo de pago');
        if(codError || codPago === undefined){
            res.status(404).json({ message: codError });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const casouso = new ActualizarPago(repo);

        const dto = req.body;
        const actualizacion = true;
        const pagoActualizado = await casouso.ejecutar(dto, em, codPago, actualizacion);
        if(Array.isArray(pagoActualizado)){
            res.status(404).json({ message: pagoActualizado[0] });
            return;
        };

        res.status(200).json({ message: 'Pago creado con exito.', data: pagoActualizado });
        return;
    }catch(error:any){
        console.error( "Error al actualizar el pago", error );
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const remove = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor:codPago, error:codError} = validarCodigo(req.params.id, 'codigo de pago');
        if(codError || codPago === undefined){
            res.status(404).json({ message: codError });
            return;
        };

        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const casouso = new EliminarPago(repo);

        const resultado = await casouso.ejecutar(codPago);
        if(resultado.length > 0 ){
            res.status(404).json({ message: resultado });
            return;
        };

        res.status(200).json({ message: 'Pago eliminado con exito', data: [] });
        return;
    }catch(error:any){
        console.error( "Error al buscar el pago para eliminar", error );
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    };
};

export const getStripeSession = async (req:Request, res:Response):Promise<void> => {
    try{
        console.log("req.params.id: ", req.params.id);
        const session = await stripe.checkout.sessions.retrieve(req.params.id);
        const pagoId = session.metadata?.pago_id;
        console.log("pagoId extraido de metadata:", pagoId);
        if(!pagoId){
            res.status(404).json({ message: 'No se encontró el pago asociado a esta sesión' });
            return;
        };

        const orm = (req.app.locals as any).orm;
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const pago = await repo.buscarPago(Number(pagoId));

        if (!pago) {
            res.status(404).json({ message: 'No se encontró el pago asociado' });
            return;
        };
        console.log("Pago encontrado para devolver:", pago);

        res.status(200).json({ payment_status: session.payment_status, data: pago });
        return;
    }catch(error:any){
        console.error("Error al consultar sesión de Stripe:", error.message);
        res.status(500).json({ message: 'No se pudo validar la sesión de pago' });
        return;
    };
};

export const crearPago = async (req:Request, res:Response):Promise<void> => {
    try{
        const { metodo } = req.params;
        const {valor:codTur, error:codError} = validarCodigo(req.params.codigo_turno, 'codigo de turno');
        console.log("Parametros recibidos en el controller crearPago - codTur:", codTur, "metodo:", metodo);
        if(codError || codTur === undefined){
            res.status(404).json({ error: codError });
            return
        };

        const orm = (req.app.locals as {orm: MikroORM}).orm;
        const em = orm.em.fork();
        const repo = new PagoRepositoryORM(em);
        const casouso = new CrearPago(repo);

        const resultado = await casouso.ejecutar(codTur, metodo, em);
        console.log("Resultado del caso de uso CrearPago:", resultado);
        if(Array.isArray(resultado)){
            res.status(400).json({ tipo: "Error", errores: resultado });
            return;
        };

        if (resultado instanceof Pago){ 
            // Es un Pago en efectivo.
            res.status(200).json({ tipo: "Pago", pago: resultado });
            return;
        };

        //Sino por defecto, devuelve un pago en stripe.
        res.status(200).json({ tipo: "Stripe", sessionId: resultado.id });
        return;

    }catch(error:any){
        console.error('Error al crear un pago.', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
        return;
    };
};

export const historialPagosCliente = async (req:Request, res:Response):Promise<void> => {
    try{
        const { valor: codCliente, error: codError } = validarCodigo(req.params.codigo_cliente, 'código de cliente');
        if (codError || codCliente === undefined) {
            res.status(404).json({ message: codError });
            return;
        }
        const orm = (req.app.locals as {orm:MikroORM}).orm;
        const em = orm.em.fork();
        const repoPago = new PagoRepositoryORM(em);
        const repoCliente = new ClienteRepositoryORM(em);
        const casouso = new BuscarPagosCliente(repoPago, repoCliente);

        const pagos = await casouso.ejecutar(codCliente);
        if(typeof pagos === 'string'){
            res.status(404).json({ message: pagos });
            return;
        }
        if(pagos.length === 0){
            res.status(200).json({message: "No se encontraron pagos", data: pagos});
            return;
        };
        res.status(200).json({ message: "Pagos encontrados", data:pagos });
        return;
    }catch(error:any){
        console.error( "Error al buscar todos los pagos", error );
        res.status(500).json({error: 'Error interno del servidor.'});
        return;
    }
};

export async function generarReciboPDF(req: Request, res: Response):Promise<void> {
    try{
        const { valor: codpago, error: codError } = validarCodigo(req.params.id, 'código de pago');
        if(codError || codpago === undefined){
            res.status(400).json({message: codError});
            return;
        };
        const orm = (req.app.locals as { orm: MikroORM}).orm;
        const em = orm.em.fork();
        const pagoRepo = new PagoRepositoryORM(em);

        const pago = await pagoRepo.buscarPago(codpago);
        if(!pago){
            res.status(404).json({message: `No se encontró ningún pago con el código ${codpago}`});
            return;
        };

        const pdfBuffer = await buildReciboPDF(pago);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=recibo_${pago.id}.pdf`);
        res.send(pdfBuffer);

    }catch(error){
        console.error("Error generating PDF:", error);
        res.status(500).json({message: "Error interno del servidor"});
        return;
    };
};