const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();

async function verificarParticipante(matchId, usuarioId) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return null;
  if (match.usuarioAId !== usuarioId && match.usuarioBId !== usuarioId) return null;
  return match;
}

router.get('/:matchId', requireAuth, async (req, res, next) => {
  try {
    const match = await verificarParticipante(req.params.matchId, req.usuarioId);
    if (!match) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    const mensajes = await prisma.mensaje.findMany({
      where: { matchId: req.params.matchId },
      orderBy: { fecha: 'asc' },
    });
    res.json({ mensajes });
  } catch (err) {
    next(err);
  }
});

router.post('/:matchId', requireAuth, async (req, res, next) => {
  try {
    const match = await verificarParticipante(req.params.matchId, req.usuarioId);
    if (!match) {
      return res.status(404).json({ error: 'Conversación no encontrada' });
    }

    const { texto } = req.body;
    if (!texto || !texto.trim()) {
      return res.status(400).json({ error: 'El mensaje no puede estar vacío' });
    }

    const mensaje = await prisma.mensaje.create({
      data: { matchId: req.params.matchId, emisorId: req.usuarioId, texto: texto.trim() },
    });
    res.status(201).json({ mensaje });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
