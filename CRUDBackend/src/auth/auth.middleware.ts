import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string; // Debe coincidir con el usuario secreto usado para el access token.

export interface UserData {
    codigo: number;
    rol: 'admin' | 'peluquero' | 'cliente';
};

declare module 'express-serve-static-core' {
    export interface Request {
    user: UserData;
    }
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('Estamos en el middleware de autenticación');
    console.log("Header recibido:", req.headers.authorization);
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '1 Token no proporcionado' });
    };

    const token = authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    if (authHeader.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as UserData; // Verificamos con la clave del access token
            console.log("Decoded JWT:", decoded);
            
            req.user = decoded;
            
            return next(); // Sigue a la ruta protegida
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        };
    };
};