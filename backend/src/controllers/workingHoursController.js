const workingHoursService = require('../services/workingHoursService');

async function list(req, res, next) {
  try {
    const data = await workingHoursService.getByEstablishment(req.params.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function upsert(req, res, next) {
  try {
    const hours = Array.isArray(req.body) ? req.body : [req.body];
    const data = await workingHoursService.upsertMany(req.params.id, hours, req.user.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function updateOne(req, res, next) {
  try {
    const data = await workingHoursService.updateOne(req.params.id, req.body, req.user.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { list, upsert, updateOne };
