const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth');
const { createRating, getRatingsByEstablishment } = require('../controllers/ratingController');

router.post('/appointments/:appointmentId/rating', requireAuth, createRating);
router.get('/establishment/:establishmentId', getRatingsByEstablishment);

module.exports = router;
