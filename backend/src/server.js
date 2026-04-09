require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { toNodeHandler, fromNodeHeaders } = require('better-auth/node');
const { auth } = require('./lib/auth');

const establishmentRoutes = require('./routes/establishments');
const serviceRoutes = require('./routes/services');
const workingHoursRoutes = require('./routes/workingHours');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const ratingRoutes = require('./routes/ratings');
const uploadRoutes = require('./routes/upload');
const { startReminderJob } = require('./jobs/reminderJob');

const app = express();

// Render terminates SSL at the proxy — trust forwarded headers so
// Express (and Better Auth) see the connection as HTTPS
app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'https://agenda-facil-zeta.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// Better Auth handler must come before express.json()
app.all('/api/auth/*', toNodeHandler(auth));

app.use(express.json());

app.use('/api/establishments', establishmentRoutes);
app.use('/api/establishments', serviceRoutes);
app.use('/api/establishments', workingHoursRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/working-hours', workingHoursRoutes);
app.use('/api', appointmentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/upload', uploadRoutes);

// GET endpoint for browser-based Google OAuth initiation (avoids cross-origin cookie issue)
// Must be outside /api/auth/* to avoid being caught by the Better Auth handler above
app.get('/api/google-login', async (req, res) => {
  const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3001';
  const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const callbackURL = req.query.callbackURL || `${frontend}/establishments`;
  const role = req.query.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';
  // Para usuários NOVOS o Better Auth redireciona para newUserCallbackURL.
  // Apontamos para uma rota do backend que aplica o role escolhido no cadastro
  // e então segue para o frontend. (Usuários já existentes vão direto ao callbackURL.)
  const newUserCallbackURL = `${baseUrl}/api/google-complete?role=${role}&next=${encodeURIComponent(callbackURL)}`;
  try {
    const baRes = await auth.handler(
      new Request(`${baseUrl}/api/auth/sign-in/social`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', host: new URL(baseUrl).host },
        body: JSON.stringify({ provider: 'google', callbackURL, newUserCallbackURL }),
      })
    );
    const cookies = baRes.headers.getSetCookie ? baRes.headers.getSetCookie() : [];
    if (cookies.length) res.setHeader('Set-Cookie', cookies);
    const location = baRes.headers.get('location');
    if (location) return res.redirect(302, location);
    const body = await baRes.json().catch(() => ({}));
    if (body.url) return res.redirect(302, body.url);
    res.status(500).json({ error: 'No redirect URL from Better Auth' });
  } catch (err) {
    console.error('Google auth init error:', err);
    res.status(500).json({ error: 'Failed to initiate Google auth' });
  }
});

// Completion route for NEW Google users — applies the role chosen on /register
// then redirects to the frontend. Only reached when Better Auth created a new user.
app.get('/api/google-complete', async (req, res) => {
  const frontend = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
  const role = req.query.role === 'PROVIDER' ? 'PROVIDER' : 'CLIENT';
  const next = req.query.next || `${frontend}/establishments`;
  try {
    if (role === 'PROVIDER') {
      const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
      if (session?.user?.id) {
        const { prisma } = require('./lib/auth');
        await prisma.user.update({ where: { id: session.user.id }, data: { role: 'PROVIDER' } });
      }
    }
  } catch (err) {
    console.error('Google role assignment error:', err);
  }
  res.redirect(302, next);
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  startReminderJob();
});

module.exports = app;
