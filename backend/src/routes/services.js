const { Router } = require('express');
const controller = require('../controllers/serviceController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = Router({ mergeParams: true });

// GET /api/establishments/:id/services
router.get('/:id/services', controller.list);

// POST /api/establishments/:id/services
router.post('/:id/services', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.create);

// PUT /api/services/:id  (id = service id)
router.put('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.update);

// DELETE /api/services/:id
router.delete('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.remove);

module.exports = router;
