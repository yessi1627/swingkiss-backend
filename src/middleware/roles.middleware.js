const prisma = require('../lib/prisma');

function requireRole(...rolesPermitidos) {
  return async (req, res, next) => {
    try {
      const usuario = await prisma.usuario.findUnique({
        where: { id: req.usuarioId },
        select: { rol: true },
      });

      if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
        return res.status(403).json({ error: 'No tienes permiso para realizar esta acción' });
      }

      req.usuarioRol = usuario.rol;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireRole };
