const { Router } = require('express');
const controller = require('../controllers/appointmentController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = Router();

// GET /api/appointments
router.get('/appointments', authenticate, controller.list);

// GET /api/establishments/:id/available-slots?date=&serviceId=
router.get('/establishments/:id/available-slots', controller.availableSlots);

// POST /api/appointments
router.post('/appointments', authenticate, requireRole('CLIENT', 'ADMIN'), controller.create);

// PATCH /api/appointments/:id/status
router.patch('/appointments/:id/status', authenticate, controller.updateStatus);

module.exports = router;
