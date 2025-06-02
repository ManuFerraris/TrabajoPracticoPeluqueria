import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET as string;

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
