import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { ClienteRepository } from '../application/interfaces/ClienteRepository.js';
import { PeluqueroRepository } from '../application/interfaces/PeluqueroRepository.js';
import { RefreshTokenRepository } from './refresh-token.repository.js';
import { FailedLoginRepository } from '../shared/security/failed-login.repository.js';
import { Peluquero } from '../peluquero/peluqueros.entity.js';
import { Cliente } from '../cliente/clientes.entity.js';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

// Claves secretas para firmar los tokens
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string; 

const MAX_ATTEMPTS = 5; //Nuemro maximo de intentos permitidos
const BLOCK_TIME = 15 * 60; //15 minutos en segundos

// Genera un token con expiración de 1 hora
export const generatePasswordResetToken = (email: string): string => {
  const token = jwt.sign(
    { email }, 
    JWT_SECRET, 
    { expiresIn: '1h' });
  return token;
};

// Verifica el token y extrae el email si es válido
export const verifyPasswordResetToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
    return decoded.email;
  } catch (error) {
      console.error('Token inválido o expirado:', error);
    return null;
  }
};

function isCliente(user: Cliente | Peluquero): user is Cliente {
    return (user as Cliente).codigo_cliente !== undefined;
};

export class AuthService{
  constructor(
    private readonly clienteRepo: ClienteRepository,
    private readonly peluqueroRepo: PeluqueroRepository,
    private readonly refreshTokenRepo: RefreshTokenRepository,
    private readonly failedLoginRepo: FailedLoginRepository
  ){};

  async login(email:string, password:string):Promise<
  {ok:true; accessToken:string; refreshToken:string; user: Cliente | Peluquero} |
  {ok: false; status: number; message: string }>{

    if(!email || !password){
      return { ok: false, status: 400, message: 'Email y contraseña son requeridos' };
    };

    const failedAttempts = await this.failedLoginRepo.getAttempts(email);
    if(failedAttempts >= MAX_ATTEMPTS){
      return {
        ok: false,
        status: 429,
        message: 'Demasiados intentos. Espera 15 minutos o verifica tu correo.'
      };
    };

    let user: Cliente | Peluquero | null = null;
    user = await this.clienteRepo.findByEmail(email);
    if(!user){
        user = await this.peluqueroRepo.findByEmail(email);
    };
    if(!user || !user.rol){
      await bcrypt.compare('dummy', '$2a$12$dummyhashdummyhashdummyha');
      await this.failedLoginRepo.incrementAttempts(email);
      return { ok: false, status: 401, message: 'Email o contraseña incorrectos' };
    };

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if(!passwordsMatch){
      await bcrypt.compare('dummy', '$2a$12$dummyhashdummyhashdummyha');
      await this.failedLoginRepo.incrementAttempts(email);
      return { ok: false, status: 401, message: 'Email o contraseña incorrectos' };
    };
    const codigo = isCliente(user) ? user.codigo_cliente : user.codigo_peluquero
    const payload = {
      codigo,
      rol: user.rol,
      email: user.email,
      nombre: isCliente(user) ? user.NomyApe : user.nombre
    };
    //console.log("Payload firmado en el authService: ", payload);
    const accessToken = jwt.sign(
      payload,
      ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    const refreshToken = jwt.sign(
      payload,
      REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    );

    await this.refreshTokenRepo.add(refreshToken, user);
    await this.failedLoginRepo.resetAttempts(email);

    return { ok:true, accessToken, refreshToken, user }
  };
};