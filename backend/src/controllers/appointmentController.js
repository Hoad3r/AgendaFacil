const appointmentService = require('../services/appointmentService');

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
    const data = await appointmentService.create(req.body, req.user.id);
    res.status(201).json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status obrigatório' });
    const data = await appointmentService.updateStatus(req.params.id, status, req.user);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { list, availableSlots, create, updateStatus };
