import nodemailer from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();
const EMAIL_USER = process.env.EMAIL_USER as string;
const EMAIL_PASS = process.env.EMAIL_PASS as string;

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail', // o el servicio que uses (Outlook, etc.)
  auth: {
    user: EMAIL_USER, // Tu email
    pass: EMAIL_PASS // Tu contraseña (o una contraseña de app si usas Gmail; para esto usar https://myaccount.google.com/apppasswords) 
  },
  tls: {
    rejectUnauthorized: false // Permite certificados autofirmados
  }
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `http://localhost:3001/reset-password/${token}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: 'Recuperación de contraseña',
    html: `<p>Para recuperar tu contraseña, haz clic en el siguiente enlace: <a href="${resetUrl}">${resetUrl}</a></p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.response);
  } catch (error) {
    console.error('Error enviando email:', error);
  }
};

