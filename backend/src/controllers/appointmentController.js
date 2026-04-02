const appointmentService = require('../services/appointmentService');
const { sendEmail } = require('../lib/email');

async function list(req, res, next) {
  try {
    const data = await appointmentService.listForUser(req.user);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function availableSlots(req, res, next) {
  try {
    const { id } = req.params;
    const { date, serviceId } = req.query;
    if (!date || !serviceId) {
      return res.status(400).json({ error: 'Parâmetros date e serviceId são obrigatórios' });
    }
    const slots = await appointmentService.getSlots(id, serviceId, date);
    res.json(slots);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const appointment = await appointmentService.create(req.body, req.user.id);
    res.status(201).json(appointment);

    setImmediate(async () => {
      try {
        const clientName = appointment.client?.name || 'Cliente';
        const providerEmail = appointment.establishment?.owner?.email;
        const serviceName = appointment.service?.name || 'Serviço';
        const date = new Date(appointment.dateTime).toLocaleString('pt-BR', {
          dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
        });

        await sendEmail({
          to: appointment.client.email,
          subject: `Agendamento confirmado — ${serviceName}`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2>Agendamento realizado!</h2>
              <p>Olá, ${clientName}!</p>
              <p>Seu agendamento de <strong>${serviceName}</strong> foi realizado com sucesso.</p>
              <p><strong>Data:</strong> ${date}</p>
              <p><strong>Estabelecimento:</strong> ${appointment.establishment?.name}</p>
              <p>Aguarde a confirmação do prestador.</p>
            </div>
          `,
        });

        if (providerEmail) {
          await sendEmail({
            to: providerEmail,
            subject: `Novo agendamento — ${serviceName}`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
                <h2>Novo agendamento!</h2>
                <p>O cliente <strong>${clientName}</strong> agendou <strong>${serviceName}</strong> para ${date}.</p>
              </div>
            `,
          });
        }
      } catch (e) {
        console.error('[EMAIL] Erro ao enviar notificação de agendamento:', e.message);
      }
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status obrigatório' });
    const updated = await appointmentService.updateStatus(req.params.id, status, req.user);
    res.json(updated);

    setImmediate(async () => {
      try {
        const clientEmail = updated.client?.email;
        const serviceName = updated.service?.name || 'Serviço';
        if (!clientEmail) return;

        if (updated.status === 'CONFIRMED') {
          await sendEmail({
            to: clientEmail,
            subject: `Agendamento confirmado — ${serviceName}`,
            html: `<div style="font-family:sans-serif"><p>Seu agendamento de <strong>${serviceName}</strong> foi <strong>confirmado</strong> pelo prestador!</p></div>`,
          });
        } else if (updated.status === 'CANCELLED') {
          await sendEmail({
            to: clientEmail,
            subject: `Agendamento cancelado — ${serviceName}`,
            html: `<div style="font-family:sans-serif"><p>Infelizmente seu agendamento de <strong>${serviceName}</strong> foi <strong>cancelado</strong>.</p></div>`,
          });
        }
      } catch (e) {
        console.error('[EMAIL] Erro ao enviar notificação de status:', e.message);
      }
    });
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { list, availableSlots, create, updateStatus };
