const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function assertOwnership(establishmentId, userId) {
  const est = await prisma.establishment.findUnique({ where: { id: establishmentId } });
  if (!est) throw { status: 404, message: 'Estabelecimento não encontrado' };
  if (est.ownerId !== userId) throw { status: 403, message: 'Acesso negado' };
}

async function getByEstablishment(establishmentId) {
  return prisma.workingHours.findMany({
    where: { establishmentId },
    orderBy: { dayOfWeek: 'asc' },
  });
}

async function upsertMany(establishmentId, hoursArray, userId) {
  await assertOwnership(establishmentId, userId);

  const results = [];
  for (const h of hoursArray) {
    const existing = await prisma.workingHours.findFirst({
      where: { establishmentId, dayOfWeek: h.dayOfWeek },
    });
    if (existing) {
      results.push(
        await prisma.workingHours.update({
          where: { id: existing.id },
          data: { startTime: h.startTime, endTime: h.endTime },
        })
      );
    } else {
      results.push(
        await prisma.workingHours.create({
          data: { establishmentId, dayOfWeek: h.dayOfWeek, startTime: h.startTime, endTime: h.endTime },
        })
      );
    }
  }
  return results;
}

async function updateOne(id, data, userId) {
  const wh = await prisma.workingHours.findUnique({ where: { id } });
  if (!wh) throw { status: 404, message: 'Horário não encontrado' };
  await assertOwnership(wh.establishmentId, userId);
  return prisma.workingHours.update({ where: { id }, data });
}

async function removeByDay(establishmentId, dayOfWeek, userId) {
  await assertOwnership(establishmentId, userId);
  await prisma.workingHours.deleteMany({ where: { establishmentId, dayOfWeek } });
}

module.exports = { getByEstablishment, upsertMany, updateOne, removeByDay };
