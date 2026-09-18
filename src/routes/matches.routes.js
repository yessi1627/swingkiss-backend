const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { serializarUsuario } = require('../utils/serializar');

const router = express.Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const matches = await prisma.match.findMany({
      where: { OR: [{ usuarioAId: req.usuarioId }, { usuarioBId: req.usuarioId }] },
      include: {
        usuarioA: { include: { fotos: true } },
        usuarioB: { include: { fotos: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    const resultado = matches.map((m) => {
      const otro = m.usuarioAId === req.usuarioId ? m.usuarioB : m.usuarioA;
      return {
        id: m.id,
        fecha: m.fecha,
        perfil: serializarUsuario(otro),
      };
    });

    res.json({ matches: resultado });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
