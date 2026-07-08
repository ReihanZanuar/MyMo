const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/me', auth, userController.getProfile);

router.put('/me',
  auth,
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    validate
  ],
  userController.updateProfile
);

router.put('/me/password',
  auth,
  [
    body('oldPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
    validate
  ],
  userController.changePassword
);

router.put('/me/avatar',
  auth,
  [
    body('avatarUrl').notEmpty(),
    validate
  ],
  userController.updateAvatar
);

router.delete('/me', auth, userController.deleteAccount);

module.exports = router;
