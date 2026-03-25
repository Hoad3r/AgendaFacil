const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assertOwnership(establishmentId, userId) {
  const est = await prisma.establishment.findUnique({ where: { id: establishmentId } });
  if (!est) throw { status: 404, message: 'Estabelecimento não encontrado' };
  if (est.ownerId !== userId) throw { status: 403, message: 'Acesso negado' };
  return est;
}

async function listByEstablishment(establishmentId) {
  return prisma.service.findMany({
    where: { establishmentId, active: true },
    orderBy: { name: 'asc' },
  });
}

async function listAll(establishmentId) {
  return prisma.service.findMany({
    where: { establishmentId },
    orderBy: { name: 'asc' },
  });
}

async function create(data, establishmentId, userId) {
  await assertOwnership(establishmentId, userId);
  return prisma.service.create({ data: { ...data, establishmentId } });
}

async function update(id, data, userId) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw { status: 404, message: 'Serviço não encontrado' };
  await assertOwnership(service.establishmentId, userId);
  return prisma.service.update({ where: { id }, data });
}

async function remove(id, userId) {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw { status: 404, message: 'Serviço não encontrado' };
  await assertOwnership(service.establishmentId, userId);
  return prisma.service.update({ where: { id }, data: { active: false } });
}

module.exports = { listByEstablishment, listAll, create, update, remove };
