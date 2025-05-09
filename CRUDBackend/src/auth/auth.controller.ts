import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ClienteRepository } from '../cliente/cliente.repository.js';
import { PeluqueroRepository } from '../peluquero/peluquero.repository.js';
import { Cliente } from '../cliente/clientes.entity.js';
import { Peluquero } from '../peluquero/peluqueros.entity.js';
import { RefreshTokenRepository } from './refresh-token.repository.js';
import { RefreshToken } from './refresh-token.entity.js';
import { timingSafeEqual } from 'crypto';
import { em } from '../shared/db/orm.js';

function isCliente(user: Cliente | Peluquero): user is Cliente {
    return (user as Cliente).codigo_cliente !== undefined;
};

function isPeluquero(user: Cliente | Peluquero): user is Cliente {
    return (user as Peluquero).codigo_peluquero !== undefined;
};

async function safeCompare(a: string, b: string): Promise<boolean> {
    try {
        return timingSafeEqual(
            Buffer.from(a),
            Buffer.from(b)
        );
    } catch {
        return false;
    };
};

// La clave secreta para los tokens (¡en producción usar variables de entorno!)
const ACCESS_TOKEN_SECRET = 'CLAVE_SECRET';
const REFRESH_TOKEN_SECRET = 'REFRESH_TOKEN_CLAVE_SECRET'; // Se recomienda cambiar esta clave y guardarla en un lugar seguro, como una variable de entorno.

// Login de cliente o peluquero recibe el email y la contraseña del cliente o peluquero y devuelve un token de acceso y un refresh token
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log("Login recibido con:", email, password);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    };

    let user: Cliente | Peluquero | null = null;
    let rol: 'cliente' | 'peluquero' | null = null; // Asignamos el rol recibido a la variable rol  

    user = await ClienteRepository.findByEmail(email);
    if (user) {
        rol = 'cliente';
    } else {
        user = await PeluqueroRepository.findByEmail(email);
        if (user) rol = 'peluquero';
    };

    console.log("Rol recibido:", rol);

    if (!user || !rol) {
        // Operación dummy para mantener tiempo constante
        await bcrypt.compare('dummy', '$2a$12$dummyhashdummyhashdummyha');
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    };

    // Verificación de contraseña con protección contra timing attacks
    const passwordsMatch = await bcrypt.compare(password, user.password);

    // Operación dummy para mantener tiempo constante en caso de error
    const dummyCompare = await bcrypt.compare('dummy', '$2a$12$dummyhashdummyhashdummyha'); 

    if (!passwordsMatch) {
        // Comparación segura en tiempo para evitar leaks de información
        await safeCompare(password, dummyCompare.toString());
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    };

    // Usamos el type guard isCliente para discriminar entre Cliente y Peluquero
    let codigo: number;
    if (isCliente(user)) {
        codigo = user.codigo_cliente;
    } else {
        codigo = user.codigo_peluquero;
    };

    // Generar el token JWT
    const accessToken = jwt.sign(
        { codigo, rol },
        ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

    // Crear el refresh token (expira en 30 días)
    const refreshToken = jwt.sign(
        { codigo, rol},
        REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
    );

    // Guardar el refresh token en la base de datos
    if (isCliente(user)) {
        await RefreshTokenRepository.add(refreshToken, user);
    };

    if(isPeluquero(user)) {
        await RefreshTokenRepository.add(refreshToken, user);
    };

    if(user instanceof Cliente){
    return res.json({
        accessToken,
        refreshToken,
        user: {
            codigo_cliente: user.codigo_cliente,
            email: user.email,
            rol,
            nombre: user.NomyApe,}
        });
        } else{
            return res.json({
                accessToken,
                refreshToken,
                user: {
                    codigo_peluquero: user.codigo_peluquero,
                    email: user.email,
                    rol,
                    nombre: user.nombre,}
                });
        }
    };

export const refreshToken = async (req: Request, res: Response) => {
    const token = req.body.refreshToken; // Obtenemos el refresh token del cuerpo de la solicitud
    
    if (!token) {
        return res.status(401).json({ message: 'Refresh token no proporcionado' });
    }
    
    try {
        // Verificamos el refresh token con la clave secreta
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { codigo: number, rol: string };
    
        // Validamos que ese token todavía exista en la base de datos
        const storedToken = await em.findOne(RefreshToken, { token });

        if (!storedToken) {
        return res.status(403).json({ message: 'Refresh token inválido o ya no es válido (revocado)' });
        };

        // Si el refresh token es válido, generamos un nuevo access token
        const accessToken = jwt.sign(
            { codigo: decoded.codigo, rol: decoded.rol },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '3h' } // Nuevo access token con expiración de 1 hora
        );
    
        return res.json({ accessToken });
        } catch (error) {
        return res.status(403).json({ message: 'Refresh token inválido o expirado' });
        };
    };

export const logout = async (req: Request, res: Response) => {
        const refreshToken = req.body.refreshToken; // Obtenemos el refresh token del cuerpo de la solicitud
    
        if (!refreshToken) {
            return res.status(400).json({ message: 'No se proporcionó el refresh token' });
        };
    
        try {
            // Verificamos el refresh token con la clave secreta
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as { codigo: number, rol: string };
            
            // Verificar el rol y el tipo de usuario
            const storedToken = await em.findOne(RefreshToken, { token: refreshToken });
            if (!storedToken) {
                return res.status(403).json({ message: 'Refresh token inválido o ya no es válido (revocado)' });
            };
            
            // Eliminar el refresh token de la base de datos
            if (decoded.rol === 'cliente') {
                await RefreshTokenRepository.remove({ token: refreshToken});
            } else if (decoded.rol === 'peluquero') {
                await RefreshTokenRepository.remove({ token: refreshToken });
            };
    
            return res.status(200).json({ message: 'Logout exitoso' });
        } catch (error) {
            return res.status(403).json({ message: 'Token inválido o expirado' });
        };
    };