const ratingService = require('../services/ratingService');

async function createRating(req, res, next) {
  try {
    const { appointmentId } = req.params;
    const { score, comment } = req.body;
    const rating = await ratingService.createRating({
      appointmentId,
      score: Number(score),
      comment,
      clientId: req.user.id,
    });
    res.status(201).json(rating);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  }
}

async function getRatingsByEstablishment(req, res, next) {
  try {
    const ratings = await ratingService.getRatingsByEstablishment(req.params.establishmentId);
    res.json(ratings);
  } catch (err) {
    next(err);
  }
}

module.exports = { createRating, getRatingsByEstablishment };
