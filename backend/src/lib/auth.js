const { betterAuth } = require('better-auth');
const { prismaAdapter } = require('better-auth/adapters/prisma');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [
    'http://localhost:5173',
    'https://agenda-facil-zeta.vercel.app',
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.replace(/\/$/, '')] : []),
  ],

  advanced: {
    // Frontend (Vercel) e backend (Render) são domínios diferentes. Para o
    // cookie de sessão ser enviado em requisições XHR cross-site, ele precisa
    // ser SameSite=None; Secure. Detectamos produção pela baseURL https (mais
    // confiável que NODE_ENV). Em dev (http://localhost) mantemos o padrão,
    // pois Secure exige HTTPS e localhost:5173/:3001 são same-site (Lax basta).
    ...((process.env.BETTER_AUTH_URL || '').startsWith('https')
      ? { defaultCookieAttributes: { sameSite: 'none', secure: true } }
      : {}),
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = require('./email');
      await sendEmail({
        to: user.email,
        subject: 'Redefinição de senha — AgendaFácil',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2>Redefinir sua senha</h2>
            <p>Olá, ${user.name}!</p>
            <p>Clique no botão abaixo para redefinir sua senha. O link expira em 1 hora.</p>
            <a href="${url}" style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
              Redefinir senha
            </a>
            <p style="color:#64748b;font-size:13px">Se você não solicitou isso, ignore este email.</p>
          </div>
        `,
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = require('./email');
      await sendEmail({
        to: user.email,
        subject: 'Confirme seu email — AgendaFácil',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
            <h2>Bem-vindo ao AgendaFácil!</h2>
            <p>Olá, ${user.name}!</p>
            <p>Clique no botão abaixo para verificar seu email e ativar sua conta.</p>
            <a href="${url}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0">
              Verificar email
            </a>
          </div>
        `,
      });
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURI: `${process.env.BETTER_AUTH_URL || 'http://localhost:3001'}/api/auth/callback/google`,
    },
  },

  account: {
    // Frontend (Vercel), backend (Render) e Google são 3 domínios distintos.
    // O cookie assinado `state` não retorna de forma confiável no callback
    // cross-site atrás do proxy Cloudflare do Render, causando state_mismatch.
    // O registro de verificação no banco já garante a proteção CSRF (token
    // aleatório, uso único, deletado após uso), então pulamos o check do cookie.
    skipStateCookieCheck: true,

    accountLinking: {
      enabled: true,
      // Google comprova a posse do email (email_verified), então é confiável
      // para vincular automaticamente a uma conta existente de mesmo email.
      trustedProviders: ['google'],
      // A entrega de email ainda está em configuração, então contas de
      // email/senha podem ficar não-verificadas. Permitimos vincular o Google
      // mesmo assim — o Google já garante a posse do email. (Após o primeiro
      // login Google a conta local passa a emailVerified=true automaticamente.)
      requireLocalEmailVerified: false,
    },
  },

  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'CLIENT' },
      phone: { type: 'string', required: false },
    },
  },
});

module.exports = { auth, prisma };
