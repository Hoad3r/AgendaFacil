const { Router } = require('express');
const controller = require('../controllers/workingHoursController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = Router({ mergeParams: true });

// GET /api/establishments/:id/working-hours
router.get('/:id/working-hours', controller.list);

// POST /api/establishments/:id/working-hours
router.post('/:id/working-hours', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.upsert);

// PUT /api/working-hours/:id
router.put('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.updateOne);

module.exports = router;
