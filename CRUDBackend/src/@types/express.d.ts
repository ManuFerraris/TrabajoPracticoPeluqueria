// This file is used to extend the Express Request object with custom properties.
// Es util para agregar informacion del usuario luego de la authentication.
declare namespace Express {
    export interface Request {
        user: {
            codigo: number;
            rol: string;
        };
    }
}
