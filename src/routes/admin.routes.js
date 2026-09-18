const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');
const { serializarUsuario } = require('../utils/serializar');

const router = express.Router();

router.get('/usuarios', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: { fotos: true },
      orderBy: { fechaRegistro: 'desc' },
    });
    res.json({ usuarios: usuarios.map(serializarUsuario) });
  } catch (err) {
    next(err);
  }
});

router.put('/usuarios/:id/rol', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { rol } = req.body;
    if (!['admin', 'gratis', 'premium'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    const usuario = await prisma.usuario.update({ where: { id: req.params.id }, data: { rol } });
    res.json({ usuario: serializarUsuario(usuario) });
  } catch (err) {
    next(err);
  }
});

router.get('/reportes', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const reportes = await prisma.reporte.findMany({
      include: { reporter: true, reportado: true },
      orderBy: { fecha: 'desc' },
    });
    res.json({
      reportes: reportes.map((r) => ({
        id: r.id,
        motivo: r.motivo,
        descripcion: r.descripcion,
        estado: r.estado,
        fecha: r.fecha,
        reporter: serializarUsuario(r.reporter),
        reportado: serializarUsuario(r.reportado),
      })),
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
