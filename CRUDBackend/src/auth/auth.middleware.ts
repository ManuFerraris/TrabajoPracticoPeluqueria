import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = 'CLAVE_SECRETA'; // Debe coincidir con el usuario secreto usado para el access token.
const REFRESH_TOKEN_SECRET = 'REFRESH_TOKEN_CLAVE_SECRETA'; // La clave secreta para el refresh token.

interface TokenPayload {
    codigo: number;
    rol: string;
};

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token no proporcionado' });
    };

    const token = authHeader?.split(' ')[1];

    if (!token) return res.sendStatus(401);

    // Si el token es un access token
    if (authHeader.startsWith('Bearer ')) {
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET); // Verificamos con la clave del access token
            req.user = decoded as TokenPayload; // Ahora 'req.user' tiene el tipo correcto
            return next(); // Sigue a la ruta protegida
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
    }

    // Si no es un access token, puede ser un refresh token
    try {
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET); // Verificamos con la clave del refresh token
        req.user = decoded as TokenPayload; // Deberíamos establecer el mismo tipo de usuario
        return next(); // Sigue a la ruta protegida
    } catch (error) {
        return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }
};