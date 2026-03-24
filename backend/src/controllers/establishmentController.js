const establishmentService = require('../services/establishmentService');

async function list(req, res, next) {
  try {
    const { category } = req.query;
    const data = await establishmentService.list(category);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const data = await establishmentService.getById(req.params.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const data = await establishmentService.create(req.body, req.user.id);
    res.status(201).json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const data = await establishmentService.update(req.params.id, req.body, req.user.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await establishmentService.remove(req.params.id, req.user.id);
    res.status(204).send();
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function myEstablishments(req, res, next) {
  try {
    const data = await establishmentService.getByOwner(req.user.id);
    res.json(data);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

module.exports = { list, getById, create, update, remove, myEstablishments };
