const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { serializarUsuario } = require('../utils/serializar');
const { enviarCodigoRecuperacion } = require('../lib/mailer');

const router = express.Router();

function firmarToken(usuario) {
  return jwt.sign({ sub: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

router.post('/registro', async (req, res, next) => {
  try {
    const { nombre, email, password, tipoCuenta } = req.body;

    if (!nombre || !email || !password || !tipoCuenta) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!['individual', 'pareja'].includes(tipoCuenta)) {
      return res.status(400).json({ error: 'Tipo de cuenta inválido' });
    }

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return res.status(409).json({ error: 'Ese email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: { nombre, email, passwordHash, tipoCuenta },
    });

    const token = firmarToken(usuario);
    res.status(201).json({ token, usuario: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Completa email y contraseña' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const valido = await bcrypt.compare(password, usuario.passwordHash);
    if (!valido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const token = firmarToken(usuario);
    res.json({ token, usuario: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      include: { fotos: true },
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ usuario: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.post('/olvide-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Ingresa tu email' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (usuario) {
      const codigo = String(Math.floor(100000 + Math.random() * 900000));
      const resetCodigoHash = await bcrypt.hash(codigo, 10);
      const resetCodigoExpira = new Date(Date.now() + 15 * 60 * 1000);

      await prisma.usuario.update({
        where: { id: usuario.id },
        data: { resetCodigoHash, resetCodigoExpira },
      });

      await enviarCodigoRecuperacion(usuario.email, codigo);
    }

    res.json({ mensaje: 'Si ese correo está registrado, te enviamos un código de recuperación.' });
  } catch (err) {
    next(err);
  }
});

router.post('/restablecer-password', async (req, res, next) => {
  try {
    const { email, codigo, nuevaPassword } = req.body;
    if (!email || !codigo || !nuevaPassword) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (nuevaPassword.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.resetCodigoHash || !usuario.resetCodigoExpira) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }
    if (usuario.resetCodigoExpira < new Date()) {
      return res.status(400).json({ error: 'El código expiró, solicita uno nuevo' });
    }

    const codigoValido = await bcrypt.compare(codigo, usuario.resetCodigoHash);
    if (!codigoValido) {
      return res.status(400).json({ error: 'Código inválido o expirado' });
    }

    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { passwordHash, resetCodigoHash: null, resetCodigoExpira: null },
    });

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
