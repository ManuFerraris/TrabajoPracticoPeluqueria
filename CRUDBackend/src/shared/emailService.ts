import nodemailer from 'nodemailer';

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail', // o el servicio que uses (Outlook, etc.)
  auth: {
    user: 'pferramondo22@gmail.com', // Tu email
    pass: 'dpqw quxl sose prjv' // Tu contraseña (o una contraseña de app si usas Gmail; para esto usar https://myaccount.google.com/apppasswords) 
  }
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `http://localhost:3001/reset-password/${token}`;

  const mailOptions = {
    from: 'pferramondo22@gmail.com',
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

