const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

async function enviarCodigoRecuperacion(email, codigo) {
  await transporter.sendMail({
    from: `SwingKiss <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Tu código para recuperar tu contraseña — SwingKiss',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Recupera tu contraseña</h2>
        <p>Usa este código en la app para crear una nueva contraseña. Vence en 15 minutos.</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center;">${codigo}</p>
        <p>Si no pediste esto, ignora este correo.</p>
      </div>
    `,
  });
}

module.exports = { enviarCodigoRecuperacion };
