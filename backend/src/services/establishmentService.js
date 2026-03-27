const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function list(filters = {}) {
  const { q, category } = filters;

  const where = {};
  if (category) where.category = category;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ];
  }

  const establishments = await prisma.establishment.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true } },
      ratings: { select: { score: true } },
      services: { where: { active: true }, select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return establishments.map((e) => {
    const { ratings, services, ...rest } = e;
    const averageRating = ratings.length
      ? parseFloat((ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1))
      : null;
    return { ...rest, services, averageRating, ratingCount: ratings.length };
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
