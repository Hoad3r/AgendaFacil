const { prisma } = require('../lib/auth');

async function createRating({ appointmentId, score, comment, clientId }) {
  if (score < 1 || score > 5) {
    const err = new Error('Nota deve ser entre 1 e 5'); err.status = 400; throw err;
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { rating: true },
  });

  if (!appointment) {
    const err = new Error('Agendamento não encontrado'); err.status = 404; throw err;
  }
  if (appointment.clientId !== clientId) {
    const err = new Error('Acesso negado'); err.status = 403; throw err;
  }
  if (appointment.status !== 'COMPLETED') {
    const err = new Error('Só é possível avaliar agendamentos concluídos'); err.status = 400; throw err;
  }
  if (appointment.rating) {
    const err = new Error('Este agendamento já foi avaliado'); err.status = 409; throw err;
  }

  return prisma.rating.create({
    data: {
      score,
      comment,
      clientId,
      establishmentId: appointment.establishmentId,
      appointmentId,
    },
  });
}

async function getRatingsByEstablishment(establishmentId) {
  const ratings = await prisma.rating.findMany({
    where: { establishmentId },
    include: { client: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return ratings;
}

module.exports = { createRating, getRatingsByEstablishment };
