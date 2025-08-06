// This file is used to extend the Express Request object with custom properties.
// Es util para agregar informacion del usuario luego de la authentication.

import { Roles } from "../auth/auth.middleware.js";

declare namespace Express {
    export interface Request {
        user: {
            codigo: number;
            rol: Roles; // Usamos el tipo específico en lugar de 'string'
        };
    }
}
