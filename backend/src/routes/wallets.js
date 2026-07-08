const express = require('express');
const { body, param } = require('express-validator');
const walletController = require('../controllers/walletController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', auth, walletController.getWallets);

router.post('/',
  auth,
  [
    body('type').isIn(['bank', 'ewallet', 'cash']),
    body('provider').trim().notEmpty(),
    body('name').trim().notEmpty(),
    body('balance').optional().isFloat({ min: 0 }),
    body('color').optional().trim(),
    validate
  ],
  walletController.createWallet
);

router.put('/:id',
  auth,
  [
    param('id').isInt(),
    body('type').optional().isIn(['bank', 'ewallet', 'cash']),
    body('provider').optional().trim().notEmpty(),
    body('name').optional().trim().notEmpty(),
    body('balance').optional().isFloat({ min: 0 }),
    body('color').optional().trim(),
    validate
  ],
  walletController.updateWallet
);

router.delete('/:id',
  auth,
  [
    param('id').isInt(),
    validate
  ],
  walletController.deleteWallet
);

router.get('/:id/balance',
  auth,
  [
    param('id').isInt(),
    validate
  ],
  walletController.getWalletBalance
);

module.exports = router;
