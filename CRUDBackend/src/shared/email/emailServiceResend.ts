import { Resend } from "resend";
import dotenv from 'dotenv';
import validator from 'validator';
import { generarHtmlRecuperacion } from "./HTMLRecPassword.js";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY as string);
const REMITENTE = process.env.RESEND_FROM as string;

if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM) {
    throw new Error('Faltan variables de entorno para Resend');
};

export const sendPasswordResetEmail = async(email:string, token:string):Promise<void> => {
    if (!validator.isEmail(email)) {
        throw new Error(`Email inválido: ${email}`);
    };

    if (!token || token.length < 10) {
        throw new Error(`Token inválido: ${token}`);
    };

    const resetUrl = `http://localhost:3001/reset-password/${token}`;
    const html = generarHtmlRecuperacion(resetUrl);

    //console.log(`Enviando email de recuperación a ${email} con token ${token}`);
    try{
        const {data, error} = await resend.emails.send({
            from:REMITENTE,
            to:email,
            subject: 'Recuperacion de contraseña',
            html,
        });
        if (error) {
            console.error(`Error al enviar email a ${email}:`, error);
            throw new Error('Error al enviar el correo');
        };
        //console.log(`Email enviado correctamente a ${email}. ID: ${data?.id}`);
    }catch(error:any){
        console.error(`Error al enviar email a ${email}:`, error);
    };
};