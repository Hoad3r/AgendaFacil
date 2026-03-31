const { parseISO, getDay, format, addMinutes, startOfDay, endOfDay, isToday } = require('date-fns');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

async function getAvailableSlots(establishmentId, serviceId, dateStr) {
  const date = parseISO(dateStr);
  const dayOfWeek = getDay(date);

  const workingHours = await prisma.workingHours.findFirst({
    where: { establishmentId, dayOfWeek },
  });

  if (!workingHours) return [];

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) throw { status: 404, message: 'Serviço não encontrado' };

  const startMin = timeToMinutes(workingHours.startTime);
  const endMin = timeToMinutes(workingHours.endTime);
  const duration = service.duration;

  const slots = [];
  for (let t = startMin; t + duration <= endMin; t += duration) {
    slots.push(t);
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      establishmentId,
      dateTime: { gte: dayStart, lte: dayEnd },
      status: { not: 'CANCELLED' },
    },
  });

  const now = new Date();
  const dateIsToday = isToday(date);
  const currentMinutes = dateIsToday ? now.getHours() * 60 + now.getMinutes() : 0;

  const available = slots.filter((slotStart) => {
    if (dateIsToday && slotStart <= currentMinutes) return false;
    const slotEnd = slotStart + duration;
    return !existingAppointments.some((appt) => {
      const apptStart = timeToMinutes(format(appt.dateTime, 'HH:mm'));
      const apptEnd = timeToMinutes(format(appt.endTime, 'HH:mm'));
      return slotStart < apptEnd && slotEnd > apptStart;
    });
  });

  return available.map(minutesToTime);
}

module.exports = { getAvailableSlots };
