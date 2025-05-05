import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (requiredRole: 'cliente' | 'peluquero') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

    if (!user || user.rol !== requiredRole) {
        return res.status(403).json({ message: 'Acceso denegado: rol incorrecto' });
    };

    next();
    };
};