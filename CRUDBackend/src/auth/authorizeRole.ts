import { Request, Response, NextFunction } from 'express';

//Roles disponibles
type Roles = 'cliente' | 'peluquero' | 'admin';

//Tipado del usuario
interface UserData{
    rol: Roles;
    codigo: number;
};

//Middleware que extiende el objeto Request con el usuario ya autenticado
interface AuthenticatedRequest extends Request {
    user: UserData;
};

export const authorizeRole = (requiredRoles: Roles[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        const { user } = req;

        if (!user) {
            return res.status(403).json({
                code: 'UNAUTHENTICATED',
                message: 'Debe iniciar sesion para acceder al recurso'
            });
        };
        next();
    };
};





























/*interface AuthenticatedRequest extends Request {
user: {
    rol: 'cliente' | 'peluquero';
    codigo: number;
    };
}

export const authorizeRole = (requiredRole: ('cliente' | 'peluquero')[]) => {
    return (req: Request, res: Response, next: NextFunction) => {

        const user = (req as AuthenticatedRequest).user;
        if (!user) {
            return res.status(403).json({ message: 'Usuario no autenticado' });
        };

        if(!requiredRole.includes(user.rol)){
            return res.status(403).json({ message: `Acceso denegado. Rol requerido: ${requiredRole.join(' o ')}` });
        }

    next();
    };
};*/