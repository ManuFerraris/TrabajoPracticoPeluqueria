import { Request, Response, NextFunction } from 'express';

export const authorizeRole = (requiredRole: ('cliente' | 'peluquero')[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        console.log("Entró a authorizeRole");
        const user = (req as any).user;
        console.log("Usuario en authorizeRole:", req.user);
        if (!user || !requiredRole.includes(user.rol)) {
            return res.status(403).json({ message: 'Acceso denegado: rol incorrecto' });
        };

    next();
    };
};