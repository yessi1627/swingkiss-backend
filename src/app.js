const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const perfilesRoutes = require('./routes/perfiles.routes');
const matchesRoutes = require('./routes/matches.routes');
const mensajesRoutes = require('./routes/mensajes.routes');
const adminRoutes = require('./routes/admin.routes');
const membresiaRoutes = require('./routes/membresia.routes');

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ estado: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/perfiles', perfilesRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/membresia', membresiaRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
