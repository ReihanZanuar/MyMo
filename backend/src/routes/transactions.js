const express = require('express');
const { body, param, query } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/',
  auth,
  [
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('offset').optional().isInt({ min: 0 }),
    query('type').optional().isIn(['income', 'expense', 'transfer']),
    query('startDate').optional().isDate(),
    query('endDate').optional().isDate(),
    validate
  ],
  transactionController.getTransactions
);

router.get('/summary',
  auth,
  [
    query('startDate').isDate(),
    query('endDate').isDate(),
    validate
  ],
  transactionController.getSummary
);

router.post('/',
  auth,
  [
    body('walletId').isInt(),
    body('toWalletId').optional().isInt(),
    body('categoryId').optional().isInt(),
    body('amount').isFloat({ min: 0 }),
    body('type').isIn(['income', 'expense', 'transfer']),
    body('description').optional().trim(),
    body('paymentMethod').optional().trim(),
    body('date').isDate(),
    validate
  ],
  transactionController.createTransaction
);

router.put('/:id',
  auth,
  [
    param('id').isInt(),
    body('walletId').optional().isInt(),
    body('toWalletId').optional().isInt(),
    body('categoryId').optional().isInt(),
    body('amount').optional().isFloat({ min: 0 }),
    body('type').optional().isIn(['income', 'expense', 'transfer']),
    body('description').optional().trim(),
    body('paymentMethod').optional().trim(),
    body('date').optional().isDate(),
    validate
  ],
  transactionController.updateTransaction
);

router.delete('/:id',
  auth,
  [
    param('id').isInt(),
    validate
  ],
  transactionController.deleteTransaction
);

module.exports = router;
