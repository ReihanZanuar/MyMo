const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
    validate
  ],
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
    validate
  ],
  authController.login
);

router.post('/google',
  [
    body('googleId').notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('name').notEmpty(),
    validate
  ],
  authController.googleAuth
);

router.post('/logout',
  authMiddleware,
  authController.logout
);

router.post('/complete-onboarding',
  authMiddleware,
  authController.completeOnboarding
);

module.exports = router;
