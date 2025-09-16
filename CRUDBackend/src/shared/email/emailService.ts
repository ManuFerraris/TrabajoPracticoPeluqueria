import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import validator from 'validator'; // npm i --save-dev @types/validator
import PDFDocument from 'pdfkit';
import { generarHtmlRecuperacion } from './HTMLRecPassword.js';
import { Pago } from '../../pago/pago.entity.js';
import { buildReciboPDF } from '../../pago/crearRecibioPDF.js';

dotenv.config();
const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail', // o el servicio a usar Outlook, etc.
  auth: {
    user: EMAIL_USER, // Tu email
    pass: EMAIL_PASS  // Tu contraseña o una contraseña de app si se usa Gmail
  },
  tls: {
    rejectUnauthorized: false // Permite certificados autofirmados
  }
});

export const sendPasswordResetEmail = async (email: string, token: string):Promise<void> => {
  if (!validator.isEmail(email)) {
    throw new Error(`Email inválido: ${email}`);
  };

  if (!token || token.length < 10) {
    throw new Error(`Token inválido: ${token}`);
  };

  const resetUrl = `http://localhost:3001/reset-password/${token}`;
  const html = generarHtmlRecuperacion(resetUrl);

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Recuperación de contraseña',
    html: html,
  };

  //console.log(`Intentando enviar email de recuperación a ${email} con token ${token}`);
  try {
    const info = await transporter.sendMail(mailOptions);
    //console.log(`Email enviado correctamente a ${email}: ${info.response}`);
  } catch (error) {
    console.error(`Error al enviar email a ${email}:`, error);
  };
};

export async function enviarReciboPorEmail(pago:Pago):Promise<void> {
  try{
    const email = pago.turno.cliente.email;
    if(!email){
      console.warn(`Email inválido: ${email}`);
      return;
    };

    if (!validator.isEmail(email)) {
      console.warn(`Email inválido: ${email}`);
      return;
    };

    const pdfBuffer = await buildReciboPDF(pago);
    //console.log("PDF del recibo generado: .", pdfBuffer);

    await transporter.sendMail({
      from: EMAIL_USER,
      to: pago.turno.cliente.email,
      subject: 'Comprobante de Pago',
      text: 'Adjunto encontrarás tu comprobante de pago.',
      attachments: [
        {
          filename: `recibo_pago_${pago.id}.pdf`,
          content: pdfBuffer,
        },
      ],
    });
  }catch(error){
    console.error("Error al enviar el recibo por email:", error);
  };
};