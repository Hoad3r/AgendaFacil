const { Router } = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter mínimo 6 caracteres'),
  ],
  controller.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido'),
    body('password').notEmpty().withMessage('Senha obrigatória'),
  ],
  controller.login
);

router.get('/me', authenticate, controller.me);

module.exports = router;
