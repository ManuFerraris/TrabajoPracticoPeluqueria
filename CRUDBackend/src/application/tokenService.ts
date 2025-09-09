import  jwt  from "jsonwebtoken";
import { Cliente } from "../cliente/clientes.entity.js";
import dotenv from "dotenv";

dotenv.config();
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

export class TokenService{
    static generarTokens(cliente:Cliente):{accessToken:string, refreshToken:string} {
        const accessToken = jwt.sign(
            {
                codigo: cliente.codigo_cliente,
                email: cliente.email,
                rol:cliente.rol
            },
            ACCESS_TOKEN_SECRET,
            {
                expiresIn:"1h"
            }
        );

        const refreshToken = jwt.sign(
            {
                codigo: cliente.codigo_cliente
            },
            REFRESH_TOKEN_SECRET,
            {
                expiresIn: "7d"
            }
        );

        return {accessToken, refreshToken};
        
    };
};