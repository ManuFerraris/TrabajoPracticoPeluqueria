import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import { ClienteRepository } from '../cliente/cliente.repository.js';
import { PeluqueroRepository } from '../peluquero/peluquero.repository.js';
import { Cliente } from '../cliente/clientes.entity.js';
import { Peluquero } from '../peluquero/peluqueros.entity.js';
import { RefreshTokenRepository } from './refresh-token.repository.js';
import { RefreshToken } from './refresh-token.entity.js';
import { em } from '../shared/db/orm.js';
import { sendPasswordResetEmail } from '../shared/emailService.js';
import { generatePasswordResetToken, verifyPasswordResetToken } from './authService.js';
import { FailedLoginRepository } from '../shared/security/failed-login.repository.js';

//Cargar variables de entorno al inicio de la aplicación
dotenv.config();

// Claves secretas para firmar los tokens
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string; 

const MAX_ATTEMPTS = 5; //Nuemro maximo de intentos permitidos
const BLOCK_TIME = 15 * 60; //15 minutos en segundos

function isCliente(user: Cliente | Peluquero): user is Cliente {
    return (user as Cliente).codigo_cliente !== undefined;
};

// Login de cliente o peluquero recibe el email y la contraseña del cliente o peluquero y devuelve un token de acceso y un refresh token
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //Verificar si el usuario ha excedido el limite de inttentos
    const failedAttempts = await FailedLoginRepository.getAttempts(email)

    if(failedAttempts >= MAX_ATTEMPTS){
        return res.status(429).json({ 
            message: "Demasiados intentos de login. Espera 15 minutos o verifica tu correo."
        });
    };

    if (!email) {
        return res.status(400).json({ message: 'Email es requerido' });
    };

    if(!password){
        return res.status(400).json({ message: 'Contraseña es requerida' });
    };

    let user: Cliente | Peluquero | null = null;
    
    // Unificamos la búsqueda del usuario
    user = await ClienteRepository.findByEmail(email);
    if (!user) {
        user = await PeluqueroRepository.findByEmail(email);
    };

    // Verificamos si encontramos un usuario y luego leemos su rol desde la base de datos
    let rol: 'cliente' | 'peluquero' | 'admin' | null = null;
    if (user) {
        rol = user.rol as 'cliente' | 'peluquero' | 'admin';
    }

    if (!user || !rol) {
        // Operación dummy para mantener tiempo constante
        await bcrypt.compare('dummy', '$2a$12$dummyhashdummyhashdummyha');
        await FailedLoginRepository.incrementAttempts(email); // <- Registra el intento fallido en Redis
        return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    };

    // Verificación de contraseña con protección contra timing attacks
    const passwordsMatch = await bcrypt.compare(password, user.password);

    if (!passwordsMatch) {
        // Comparación segura en tiempo para evitar leaks de información
        await bcrypt.compare('dummy', '$2a$12$dummyhashdummyhashdummyha');
        await FailedLoginRepository.incrementAttempts(email); // <- Registra el intento fallido en Redis
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
        { codigo, rol }, // El 'rol' ahora es el correcto
        ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
    );

    // Crear el refresh token (expira en 30 días)
    const refreshToken = jwt.sign(
        { codigo, rol}, // El 'rol' ahora es el correcto
        REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
    );

    // Guardar el refresh token en la base de datos
    try{
        await RefreshTokenRepository.add(refreshToken, user);
    }catch(error){
        console.error("Error al guardar el refresh token del CLIENTE:", error);
        return res.status(500).json({ message: 'Error al guardar el refresh token' });
    };

    //Limpiar intentos fallidos al lograr un login exitoso
    await FailedLoginRepository.resetAttempts(email)

    //Devolver estructura que espera el frontend.
    if(isCliente(user)){
    return res.json({
        accessToken,
        refreshToken,
        user: {
            codigo_cliente: user.codigo_cliente,
            email: user.email,
            rol, // Este 'rol' ya viene correcto
            nombre: user.NomyApe,}
        });
        } else{
            return res.json({
                accessToken,
                refreshToken,
                user: {
                    codigo_peluquero: user.codigo_peluquero,
                    email: user.email,
                    rol, // Este 'rol' ya viene correcto
                    nombre: user.nombre,}
                });
        }
    };

export const refreshToken = async (req: Request, res: Response) => {
    const token = req.body.refreshToken; // Obtenemos el refresh token del cuerpo de la solicitud
    console.log("Token recibido en refreshToken: ", token);
    if (!token) {
        return res.status(401).json({ message: 'Refresh token no proporcionado' });
    };
    
    try {
        // Verificamos el refresh token con la clave secreta
        const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as { codigo: number, rol: string };
    
        // Validamos que ese token todavía exista en la base de datos
        const storedToken = await em.findOne(RefreshToken, { token });

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
        } catch (error) {
            if(error instanceof jwt.TokenExpiredError){
                return res.status(401).json({ message: 'El token ha expirado, inicia sesion nuevamente' });
            }else if(error instanceof jwt.JsonWebTokenError){
                return res.status(403).json({ message: 'El token proporcionado es invalido'});
            }else{
                console.error("Error inesperado:", error);
                return res.status(500).json({ message: 'Error interno del servidor' });
            };
    };
}

export const logout = async (req: Request, res: Response) => {
    const refreshToken = req.body.refreshToken; // Obtenemos el refresh token del cuerpo de la solicitud

    if (!refreshToken) {
        return res.status(400).json({ message: 'El refresh token es obligatorio para cerrar sesión.' });
    }

    if (typeof refreshToken !== "string" || refreshToken.split('.').length !== 3) {
        return res.status(400).json({ message: 'El refresh token tiene un formato inválido.' });
    }

    try {
        // Verificar el rol y el tipo de usuario
        const storedToken = await em.findOne(RefreshToken, { token: refreshToken });
        if (!storedToken) {
            console.warn(`Intento de logout con un token inválido: ${refreshToken}`);
            return res.status(404).json({ message: 'El refresh token no está registrado.' });
        }

        // Eliminar el refresh token de la base de datos
        await RefreshTokenRepository.remove({ token: refreshToken });

        return res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: 'El refresh token ha expirado, inicia sesión nuevamente' });
        } else if (error instanceof jwt.JsonWebTokenError) {
            return res.status(403).json({ message: 'El refresh token proporcionado es inválido' });
        } else {
            console.error("Error inesperado:", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email requerido' });
    }

    let user: Cliente | Peluquero | null = null;

    // Intenta encontrar como Cliente
    user = await ClienteRepository.findByEmail(email);

    if (!user) {
        // Si no es Cliente, intenta como Peluquero
        user = await PeluqueroRepository.findByEmail(email);
    }

    if (!user) {
        // Para mayor seguridad y evitar enumeración de emails,
        // podrías considerar enviar siempre una respuesta genérica.
        // Pero para el flujo funcional, si no hay usuario, no se puede proceder.
        // Actualmente, tu frontend espera un error si el usuario no existe.
        return res.status(404).json({ message: 'Si el email está registrado, recibirás un correo de recuperación.' });
    }

    // generatePasswordResetToken solo necesita el email (según tu authService.ts)
    const token = generatePasswordResetToken(email);

    // sendPasswordResetEmail enviará el correo con el link genérico
    // ej: http://localhost:3001/reset-password/TOKEN
    await sendPasswordResetEmail(email, token);

    // Tu frontend en recoverPassword.tsx espera un mensaje de éxito.
    return res.status(200).json({ message: 'Correo de recuperación enviado si el email está registrado.' });
};

// POST /auth/reset-password
export const resetPassword = async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ message: 'Token y nueva contraseña requeridos' });
    }

    try {
        // verifyPasswordResetToken devuelve el email o null (según authService.ts)
        const emailFromToken = verifyPasswordResetToken(token);

        if (!emailFromToken) {
            // El frontend (reset-password.tsx) maneja este mensaje.
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        let user: Cliente | Peluquero | null = null;

        // Intenta encontrar como Cliente usando el email del token
        user = await ClienteRepository.findByEmail(emailFromToken);

        if (!user) {
            // Si no es Cliente, intenta como Peluquero
            user = await PeluqueroRepository.findByEmail(emailFromToken);
        }

        if (!user) {
            // Esto podría pasar si el usuario fue eliminado después de solicitar el token.
            return res.status(404).json({ message: 'Usuario no encontrado con el email asociado al token' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        // El ORM (em) se encarga de actualizar la entidad correcta (Cliente o Peluquero)
        await em.persistAndFlush(user);

        // El frontend (reset-password.tsx) espera un mensaje de éxito.
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