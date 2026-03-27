const { Router } = require('express');
const controller = require('../controllers/establishmentController');
const { authenticate, requireRole } = require('../middlewares/auth');

const router = Router();

router.get('/', controller.list);
router.get('/my', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.myEstablishments);
router.get('/:id', controller.getById);
router.post('/', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.create);
router.put('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.update);
router.delete('/:id', authenticate, requireRole('PROVIDER', 'ADMIN'), controller.remove);

module.exports = router;
