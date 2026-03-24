const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function list(category) {
  const where = category ? { category } : {};
  return prisma.establishment.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { services: { where: { active: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getById(id) {
  const est = await prisma.establishment.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      services: { where: { active: true } },
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
    },
  });
  if (!est) throw { status: 404, message: 'Estabelecimento não encontrado' };
  return est;
}

async function create(data, ownerId) {
  return prisma.establishment.create({ data: { ...data, ownerId } });
}

async function update(id, data, userId) {
  const est = await prisma.establishment.findUnique({ where: { id } });
  if (!est) throw { status: 404, message: 'Estabelecimento não encontrado' };
  if (est.ownerId !== userId) throw { status: 403, message: 'Acesso negado' };
  return prisma.establishment.update({ where: { id }, data });
}

async function remove(id, userId) {
  const est = await prisma.establishment.findUnique({ where: { id } });
  if (!est) throw { status: 404, message: 'Estabelecimento não encontrado' };
  if (est.ownerId !== userId) throw { status: 403, message: 'Acesso negado' };
  await prisma.establishment.delete({ where: { id } });
}

async function getByOwner(ownerId) {
  return prisma.establishment.findMany({
    where: { ownerId },
    include: { _count: { select: { services: true, appointments: true } } },
  });
}

module.exports = { list, getById, create, update, remove, getByOwner };
