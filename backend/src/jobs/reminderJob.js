const cron = require('node-cron');
const { prisma } = require('../lib/auth');
const { sendEmail } = require('../lib/email');

function startReminderJob() {
  cron.schedule('0 * * * *', async () => {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        dateTime: { gte: in24h, lt: in25h },
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
      include: {
        client: { select: { name: true, email: true } },
        service: { select: { name: true } },
        establishment: { select: { name: true } },
      },
    });

    for (const appt of appointments) {
      try {
        const date = new Date(appt.dateTime).toLocaleString('pt-BR', {
          dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
        });
        await sendEmail({
          to: appt.client.email,
          subject: `Lembrete: ${appt.service?.name} amanhã`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2>Lembrete de agendamento</h2>
              <p>Olá, ${appt.client.name}!</p>
              <p>Você tem um agendamento de <strong>${appt.service?.name}</strong> amanhã às ${date.split(',')[1]?.trim()}.</p>
              <p><strong>Estabelecimento:</strong> ${appt.establishment?.name}</p>
            </div>
          `,
        });
      } catch (e) {
        console.error('[REMINDER] Erro ao enviar lembrete:', appt.id, e.message);
      }
    }

    if (appointments.length > 0) {
      console.log(`[REMINDER] ${appointments.length} lembrete(s) enviado(s)`);
    }
  });

  console.log('[REMINDER] Job de lembretes iniciado (verifica a cada hora)');
}

module.exports = { startReminderJob };
