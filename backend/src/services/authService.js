const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register({ name, email, password, phone, role }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: 'E-mail já cadastrado' };

  const allowedRoles = ['CLIENT', 'PROVIDER'];
  const userRole = allowedRoles.includes(role) ? role : 'CLIENT';

  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hash, phone, role: userRole },
  });

  const token = signToken(user);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw { status: 401, message: 'Credenciais inválidas' };

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw { status: 401, message: 'Credenciais inválidas' };

  const token = signToken(user);
  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } };
}

async function getMe(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true, role: true, createdAt: true },
  });
  if (!user) throw { status: 404, message: 'Usuário não encontrado' };
  return user;
}

module.exports = { register, login, getMe };
