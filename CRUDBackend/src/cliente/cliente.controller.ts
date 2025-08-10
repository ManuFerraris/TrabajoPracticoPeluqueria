import { Request, Response } from "express";
import { MikroORM } from '@mikro-orm/core';
import { AppError } from "../shared/errors/AppError.js"; //Manejo de errores
import { ClienteRepositoryORM } from '../shared/db/ClienteRepositoryORM.js';
import { ListarClientes } from '../application/casos-uso/casosUsoCliente/ListarClientes.js';
import { validarCodigo } from '../application/validarCodigo.js';
import { ObtenerCliente } from '../application/casos-uso/casosUsoCliente/ObtenerCLiente.js';
import { EliminarCliente } from '../application/casos-uso/casosUsoCliente/EliminarCliente.js';
import { RegistrarCliente } from '../application/casos-uso/casosUsoCliente/RegistrarCliente.js';
import { ActualizarCliente } from '../application/casos-uso/casosUsoCliente/ActualizarCliente.js';
import { SignUp } from '../application/casos-uso/casosUsoCliente/SignUp.js';
import { TokenService } from '../application/tokenService.js';
import { BuscarClientePorEmail } from "../application/casos-uso/casosUsoCliente/BuscarClientePorEmail.js";

export const findAll = async(req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ClienteRepositoryORM(em);
        const casouso = new ListarClientes(repo);

        const clientes = await casouso.ejecutar();
        if(clientes.length === 0){
            res.status(404).json({ message: 'No se encontraron clientes registrados.' });
            return;
        };

        res.status(200).json({ message: 'Clientes encontrados', data:clientes });
        return;
    }catch(errores:any){
        console.error('Error al traer los clientes', errores);
        res.status(500).json({ message: 'Error interno del servidor.' });
        return;
    }
};

export const getOne = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codVal, error:codError} = validarCodigo(req.params.codigo_cliente, 'codigo cliente');
        if(codError || codVal === undefined){
            res.status(404).json({ errores:codError });
            return;
        };
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ClienteRepositoryORM(em);
        const casouso = new ObtenerCliente(repo);

        const cliente = await casouso.ejecutar(codVal);
        if(!cliente){
            res.status(404).json({ message: `No se encontro el cliente con el codigo ${codVal}.` });
            return;
        };

        res.status(200).json({ message: 'Cliente encontrado.', data:cliente });
        return;

    }catch(errores:any){
        console.error('Error al traer el cliente', errores);
        res.status(500).json({ message: 'Error interno del servidor.' });
        return;
    };
};

export const add = async (req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ClienteRepositoryORM(em);
        const casouso = new RegistrarCliente(repo);

        const dto = req.body;

        const resultado = await casouso.ejecutar(dto, em);
        if(Array.isArray(resultado)){
            res.status(400).json({ errores: resultado });
            return;
        };

        res.status(201).json({ message: 'Cliente creado con exito.', data: resultado });
        return;

    }catch(erroes:any){
        console.error('Error al registrar un cliente.', erroes);
        res.status(500).json({ message: 'Error interno del servidor' });
        return;
    };
};

export const update = async(req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codVal, error: codError} = validarCodigo(req.params.codigo_cliente, 'codigo cliente');
        if(codError || codVal === undefined){
            res.status(400).json({ errores: codError });
            return;
        };

        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ClienteRepositoryORM(em);
        const casouso = new ActualizarCliente(repo);

        const dto = req.body;
        console.log('DTO recibido: ', dto); // OK
        console.log('Codigo de cliente recibido: ', codVal);
        const actualizar = true;
        const {errores , clienteActualizado} = await casouso.ejecutar(dto, codVal, em, actualizar);

        if(errores.length > 0  || clienteActualizado === undefined){
            res.status(400).json({ message: errores });
            return;
        };

        res.status(200).json({ message: 'Cliente actualizado exitosamente', data:clienteActualizado})
        return;
    }catch(errores:any){
        console.error('Error al actualizar el cliente', errores);
        res.status(500).json({ message: 'Error interno del servidor' });
        return;
    };
};

export const remove = async (req:Request, res:Response):Promise<void> => {
    try{
        const {valor: codVal, error:codError} = validarCodigo(req.params.codigo_cliente, 'codigo cliente');
        if(codError || codVal === undefined){
            res.status(404).json({ errores:codError });
            return;
        };
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ClienteRepositoryORM(em);
        const casouso = new EliminarCliente(repo);

        const errores = await casouso.ejecutar(codVal, em);
        if(errores.length > 0){
            res.status(404).json({ message: errores[0] });
            return;
        };

        res.status(200).json({ message: 'Cliente eliminado.' });
        return;
    }catch(errores:any){
        console.error('Error al eliminar el cliente', errores);
        res.status(500).json({ message: 'Error interno del servidor.' });
        return;
    };
};

/*async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
};*/

export const signup = async(req:Request, res:Response):Promise<void> => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ClienteRepositoryORM(em);
        const casouso = new SignUp(repo);

        const dto = req.body;
        const resultado = await casouso.ejecutar(dto, em);

        if(Array.isArray(resultado)){
            res.status(400).json({ errores: resultado });
            return;
        };

        const {cliente} = resultado;
        const {accessToken, refreshToken} = TokenService.generarTokens(cliente); 

        res.status(201).json({
            message: 'Cliente dado de alta!',
            accessToken,
            refreshToken,
            data: {...cliente, password: undefined}
        });
        return;
    }catch(errores:any){
        console.error('Error al crear un cliente en el signup', errores);
        res.status(500).json({ message: 'Error interno del servidor.' });
        return;
    };
};

export const buscarClientePorEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = req.params.email;
        const orm = (req.app.locals as { orm: MikroORM }).orm;
        const em = orm.em.fork();
        const repo = new ClienteRepositoryORM(em);
        const casoUso = new BuscarClientePorEmail(repo);

        const cliente = await casoUso.ejecutar(email);
        if (!cliente) {
            res.status(404).json({ message: 'Cliente no encontrado' });
            return;
        };

        res.status(200).json({ data: cliente });
        return;
    }catch (error: any) {
        console.error('Error al buscar cliente por email:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
        return;
    };
};