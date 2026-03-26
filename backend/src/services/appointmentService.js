const { PrismaClient } = require('@prisma/client');
const { parseISO, addMinutes, isBefore, startOfDay, endOfDay } = require('date-fns');
const { getAvailableSlots } = require('../utils/availableSlots');

const prisma = new PrismaClient();

async function listForUser(user) {
  if (user.role === 'CLIENT') {
    return prisma.appointment.findMany({
      where: { clientId: user.id },
      include: {
        establishment: { select: { id: true, name: true, address: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  if (user.role === 'PROVIDER') {
    const establishments = await prisma.establishment.findMany({
      where: { ownerId: user.id },
      select: { id: true },
    });
    const ids = establishments.map((e) => e.id);
    return prisma.appointment.findMany({
      where: { establishmentId: { in: ids } },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        establishment: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, duration: true, price: true } },
      },
      orderBy: { dateTime: 'desc' },
    });
  }

  return prisma.appointment.findMany({
    include: {
      client: { select: { id: true, name: true, email: true } },
      establishment: { select: { id: true, name: true } },
      service: { select: { id: true, name: true } },
    },
    orderBy: { dateTime: 'desc' },
  });
}

async function create({ serviceId, establishmentId, dateTime, notes }, clientId) {
  const now = new Date();
  const apptDate = new Date(dateTime);

  if (isBefore(apptDate, now)) {
    throw { status: 400, message: 'Não é possível agendar no passado' };
  }

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) throw { status: 404, message: 'Serviço não encontrado' };

  const endTime = addMinutes(apptDate, service.duration);

  const conflict = await prisma.appointment.findFirst({
    where: {
      establishmentId,
      status: { not: 'CANCELLED' },
      OR: [
        { dateTime: { lt: endTime }, endTime: { gt: apptDate } },
      ],
    },
  });

  if (conflict) {
    throw { status: 409, message: 'Horário já ocupado' };
  }

  return prisma.appointment.create({
    data: {
      clientId,
      serviceId,
      establishmentId,
      dateTime: apptDate,
      endTime,
      notes,
      status: 'PENDING',
    },
    include: {
      service: { select: { name: true, duration: true, price: true } },
      establishment: { select: { name: true, address: true } },
    },
  });
}

async function updateStatus(id, status, user) {
  const appt = await prisma.appointment.findUnique({
    where: { id },
    include: { establishment: true },
  });
  if (!appt) throw { status: 404, message: 'Agendamento não encontrado' };

  if (user.role === 'CLIENT') {
    if (appt.clientId !== user.id) throw { status: 403, message: 'Acesso negado' };
    if (!['PENDING', 'CONFIRMED'].includes(appt.status)) {
      throw { status: 400, message: 'Não é possível cancelar este agendamento' };
    }
    if (status !== 'CANCELLED') throw { status: 403, message: 'Cliente só pode cancelar' };
  } else if (user.role === 'PROVIDER') {
    if (appt.establishment.ownerId !== user.id) throw { status: 403, message: 'Acesso negado' };
    if (!['CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      throw { status: 400, message: 'Status inválido' };
    }
  }

  return prisma.appointment.update({ where: { id }, data: { status } });
}

async function getSlots(establishmentId, serviceId, date) {
  return getAvailableSlots(establishmentId, serviceId, date);
}

module.exports = { listForUser, create, updateStatus, getSlots };
