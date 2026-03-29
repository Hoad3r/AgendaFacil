const serviceService = require('../services/serviceService');

async function list(req, res, next) {
  try {
    const { id } = req.params;
    const all = req.query.all === 'true' && req.user?.role === 'PROVIDER';
    const data = all
      ? await serviceService.listAll(id)
      : await serviceService.listByEstablishment(id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await serviceService.create(req.body, req.params.id, req.user.id);
    res.status(201).json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await serviceService.update(req.params.id, req.body, req.user.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await serviceService.remove(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { list, create, update, remove };
