const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { serializarUsuario } = require('../utils/serializar');

const router = express.Router();

router.post('/upgrade', requireAuth, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: { rol: 'premium' },
    });
    res.json({ usuario: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.post('/cancelar', requireAuth, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({ where: { id: req.usuarioId } });
    if (usuario.rol === 'premium') {
      await prisma.usuario.update({ where: { id: req.usuarioId }, data: { rol: 'gratis' } });
    }
    res.json({ usuario: serializarUsuario({ ...usuario, rol: 'gratis' }) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
