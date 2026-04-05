const router = require('express').Router();
const { requireAuth } = require('../middlewares/auth');
const { getSignature } = require('../controllers/uploadController');

router.get('/signature', requireAuth, getSignature);

module.exports = router;
