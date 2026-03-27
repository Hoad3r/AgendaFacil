require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const establishmentRoutes = require('./routes/establishments');
const serviceRoutes = require('./routes/services');
const workingHoursRoutes = require('./routes/workingHours');
const appointmentRoutes = require('./routes/appointments');

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/establishments', establishmentRoutes);
app.use('/api/establishments', serviceRoutes);
app.use('/api/establishments', workingHoursRoutes);
app.use('/api', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/working-hours', workingHoursRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor',
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
