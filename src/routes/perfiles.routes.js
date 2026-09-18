const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { serializarUsuario } = require('../utils/serializar');

const router = express.Router();

const LIMITE_LIKES_GRATIS = 5;

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const bloqueos = await prisma.bloqueo.findMany({
      where: { OR: [{ bloqueadorId: req.usuarioId }, { bloqueadoId: req.usuarioId }] },
    });

    const idsExcluidos = new Set([req.usuarioId]);
    bloqueos.forEach((b) => {
      idsExcluidos.add(b.bloqueadorId);
      idsExcluidos.add(b.bloqueadoId);
    });

    const perfiles = await prisma.usuario.findMany({
      where: { id: { notIn: Array.from(idsExcluidos) } },
      include: { fotos: true },
      orderBy: { fechaRegistro: 'desc' },
    });

    res.json({ perfiles: perfiles.map(serializarUsuario) });
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
    res.json({ perfil: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.put('/me', requireAuth, async (req, res, next) => {
  try {
    const { bio, edad, ubicacion, lat, lng, intereses } = req.body;

    const usuario = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: {
        ...(bio !== undefined ? { bio } : {}),
        ...(edad !== undefined ? { edad } : {}),
        ...(ubicacion !== undefined ? { ubicacion } : {}),
        ...(lat !== undefined ? { lat } : {}),
        ...(lng !== undefined ? { lng } : {}),
        ...(intereses !== undefined ? { interesesJson: JSON.stringify(intereses) } : {}),
      },
      include: { fotos: true },
    });

    res.json({ perfil: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.params.id },
      include: { fotos: true },
    });
    if (!usuario) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }
    res.json({ perfil: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.post('/:id/like', requireAuth, async (req, res, next) => {
  try {
    const aId = req.params.id;
    if (aId === req.usuarioId) {
      return res.status(400).json({ error: 'No puedes darte like a ti mismo' });
    }

    const destino = await prisma.usuario.findUnique({ where: { id: aId } });
    if (!destino) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    const solicitante = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: { rol: true },
    });

    if (solicitante.rol === 'gratis') {
      const inicioDelDia = new Date();
      inicioDelDia.setHours(0, 0, 0, 0);
      const likesHoy = await prisma.like.count({
        where: { deId: req.usuarioId, fecha: { gte: inicioDelDia } },
      });
      if (likesHoy >= LIMITE_LIKES_GRATIS) {
        return res.status(403).json({
          error: `Los usuarios gratis solo pueden dar ${LIMITE_LIKES_GRATIS} likes al día. Hazte premium para likes ilimitados.`,
        });
      }
    }

    await prisma.like.upsert({
      where: { deId_aId: { deId: req.usuarioId, aId } },
      update: {},
      create: { deId: req.usuarioId, aId },
    });

    const reciproco = await prisma.like.findUnique({
      where: { deId_aId: { deId: aId, aId: req.usuarioId } },
    });

    let match = null;
    if (reciproco) {
      const [usuarioAId, usuarioBId] = [req.usuarioId, aId].sort();
      match = await prisma.match.upsert({
        where: { usuarioAId_usuarioBId: { usuarioAId, usuarioBId } },
        update: {},
        create: { usuarioAId, usuarioBId },
      });
    }

    res.json({ match });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
