import nodemailer from 'nodemailer';

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  service: 'gmail', // o el servicio que uses (Outlook, etc.)
  auth: {
    user: 'pferramondo22@gmail.com', // Tu email
    pass: '****' // Tu contraseña (o una contraseña de app si usas Gmail; para esto usar https://myaccount.google.com/apppasswords) 
  }
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `http://localhost:3000/reset-password/${token}`; // URL para resetear la contraseña

  const mailOptions = {
    from: 'pferramondo22@gmail.com',
    to: email,
    subject: 'Recuperación de contraseña',
    html: `<p>Para recuperar tu contraseña, haz clic en el siguiente enlace: <a href="${resetUrl}">${resetUrl}</a></p>`
  };

  await transporter.sendMail(mailOptions);
};
