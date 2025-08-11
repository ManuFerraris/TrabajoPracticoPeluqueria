import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Redis from 'ioredis';
import { Request, Response } from 'express';
import { PeluqueroRepositoryORM } from '../shared/db/PeluqueroRepositoryORM.js';
import { ClienteRepositoryORM } from '../shared/db/ClienteRepositoryORM.js';
import { Cliente } from '../cliente/clientes.entity.js';
import { Peluquero } from '../peluquero/peluqueros.entity.js';
import { RefreshTokenRepository } from './refresh-token.repository.js';
import { RefreshToken } from './refresh-token.entity.js';
import { em } from '../shared/db/orm.js';
import { AuthService, verifyPasswordResetToken } from './authService.js';
import { FailedLoginRepository } from '../shared/security/failed-login.repository.js';
import { MikroORM } from '@mikro-orm/core';
import { validateResetRequest } from './validateResetRequests.js';
import { findUserByEmail } from './findUserByEmail.js';
import { sendResetInstructions } from './sendResetInstructions.js';
import redisClient from '../config/redisClient.js';

// Cargar variables de entorno al inicio de la aplicación
dotenv.config();

// Claves secretas para firmar los tokens
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string; 

// TypeGuard para verificar tipo de usuario:
function isCliente(user: Cliente | Peluquero): user is Cliente {
    return (user as Cliente).codigo_cliente !== undefined;
};

export const login = async (req: Request, res: Response) => {
    const orm = (req.app.locals as { orm:MikroORM }).orm;
    const em = orm.em.fork();

    const clienteRepo = new ClienteRepositoryORM(em);
    const peluqueroRepo = new PeluqueroRepositoryORM(em);
    const refreshTokenRepo = new RefreshTokenRepository(em);
    const failedLoginRepo = new FailedLoginRepository(redisClient);

    const authService = new AuthService(clienteRepo, peluqueroRepo, refreshTokenRepo, failedLoginRepo);

    const { email, password } = req.body;

    const resultado = await authService.login(email, password);

    if(!resultado.ok){
        return res.status(resultado.status).json({ message: resultado.message });
    };

    const {accessToken, refreshToken, user} = resultado;
    
    const userData = isCliente(user) ? {
        codigo_cliente: user.codigo_cliente,
        email: user.email,
        rol: user.rol,
        nombre: user.NomyApe
    }
    :{
        codigo_peluquero: user.codigo_peluquero,
        email: user.email,
        rol: user.rol,
        nombre: user.nombre
    };

    return res.json({ accessToken, refreshToken, user:userData });
};

export const refreshToken = async (req: Request, res: Response) => {
    const token = req.body.refreshToken; // Obtenemos el refresh token del cuerpo de la solicitud
    console.log("Token recibido en refreshToken: ", token);
    if (typeof token !== 'string' || token.trim() === '') {
        return res.status(401).json({ message: 'Refresh token no proporcionado o invalido.' });
    };
    
    try {
        // Verificamos el refresh token con la clave secreta
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { codigo: number, rol: string };
    
        // Validamos que ese token todavía exista en la base de datos
        const refreshTokenRepo = em.getRepository(RefreshToken);
        const storedToken = await refreshTokenRepo.findOne({ token });

        if (!storedToken) {
            return res.status(403).json({ message: 'El token ha sido revocado o eliminado.' });
        };

        // Generamos un nuevo access token
        const accessToken = jwt.sign(
            { codigo: decoded.codigo, rol: decoded.rol },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '3h' }
        );
    
        return res.json({ accessToken });

    }catch (error) {
        if(error instanceof jwt.TokenExpiredError){
            return res.status(401).json({ message: 'El token ha expirado, inicia sesion nuevamente.' });
        }else if(error instanceof jwt.JsonWebTokenError){
            return res.status(403).json({ message: 'El token proporcionado es invalido.'});
        }else{
            console.error("Error inesperado:", error);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        };
    };
};

export const logout = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken; // Obtenemos el refresh token del cuerpo de la solicitud

    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.split('.').length !== 3) {
        return res.status(400).json({ message: 'El refresh token es obligatorio y debe tener formato válido.' });
    };

    try {
        const refreshTokenRepo = new RefreshTokenRepository(em);
        const storedToken = await refreshTokenRepo.findByToken(refreshToken);

        if (!storedToken) {
            console.warn(`Intento de logout con un token inválido: ${refreshToken}`);
            return res.status(404).json({ message: 'El refresh token no está registrado.' });
        };

        // Eliminar el refresh token de la base de datos
        await refreshTokenRepo.removeEntity(storedToken);

        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'El refresh token ha expirado, inicia sesión nuevamente' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ message: 'El refresh token proporcionado es inválido' });
        } else {
            console.error("Error inesperado:", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        };
    };
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    try{
        const orm = (req.app.locals as { orm:MikroORM }).orm;
        const em = orm.em.fork();
        const { email } = req.body;
        const userIP = req.ip // Tomamos la ip del usuario que intenta resetear la password.

        if(!userIP){
            return res.status(404).json({ message: "No hemos podido obtener la IP del usuario." });
        };

        const validation = await validateResetRequest(email, userIP);

        if(validation === "invalid") {
            return res.status(400).json({ message: 'Email requerido' });
        };

        if (validation === "blocked") {
            return res.status(429).json({ message: "Demasiadas solicitudes de recuperación. Inténtalo más tarde." });
        }

        const user = await findUserByEmail(email, em);
        if (!user) {
            await new Promise(res => setTimeout(res, 1000));
            return res.status(200).json({ message: 'Si el email está registrado, recibirás un correo de recuperación.' });
        };

        await sendResetInstructions(email);
        return res.status(200).json({ message: 'Correo de recuperación enviado si el email está registrado.' });
    }catch(errores:any){
        console.error('Error al resetear la contraseña.', errores)
        return res.status(500).json({ message: 'Error interno del servidor.' });
    };
};

// POST /auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
    const orm = (req.app.locals as { orm:MikroORM }).orm;
    const em = orm.em.fork();

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
    };

    try {
        // verifyPasswordResetToken devuelve el email o null (según authService.ts)
        const emailFromToken = verifyPasswordResetToken(token);

        if (!emailFromToken) {
            // El frontend (reset-password.tsx) maneja este mensaje.
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        let user: Cliente | Peluquero | null = null;
        const clienteRepo = new ClienteRepositoryORM(em);
        const peluqueroRepo = new PeluqueroRepositoryORM(em);

        user = await clienteRepo.findByEmail(emailFromToken);
        if (!user) {
            user = await peluqueroRepo.findByEmail(emailFromToken);
        };
        
        if (!user) {
            // Esto podría pasar si el usuario fue eliminado después de solicitar el token.
            return res.status(404).json({ message: 'Usuario no encontrado con el email asociado al token' });
        };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await em.persistAndFlush(user);

        return res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        return res.status(500).json({ message: 'Error del servidor al resetear la contraseña' });
    }
};

export const validateResetToken = (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        return res.status(400).json({ message: 'Token requerido' });
    }

    const email = verifyPasswordResetToken(token);
    if (!email) {
        return res.status(400).json({ message: 'Token inválido o expirado' });
    }

    return res.status(200).json({ message: 'Token válido', email });
};