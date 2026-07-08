const express = require('express');
const { query } = require('express-validator');
const analyticsController = require('../controllers/analyticsController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/hourly',
  auth,
  [
    query('startDate').isDate(),
    query('endDate').isDate(),
    validate
  ],
  analyticsController.getHourlyBreakdown
);

router.get('/daily',
  auth,
  [
    query('startDate').isDate(),
    query('endDate').isDate(),
    validate
  ],
  analyticsController.getDailyBreakdown
);

router.get('/weekly',
  auth,
  [
    query('startDate').isDate(),
    query('endDate').isDate(),
    validate
  ],
  analyticsController.getWeeklyPattern
);

router.get('/category',
  auth,
  [
    query('startDate').isDate(),
    query('endDate').isDate(),
    validate
  ],
  analyticsController.getCategoryBreakdown
);

router.get('/wallet',
  auth,
  [
    query('startDate').isDate(),
    query('endDate').isDate(),
    validate
  ],
  analyticsController.getWalletBreakdown
);

router.get('/payment-method',
  auth,
  [
    query('startDate').isDate(),
    query('endDate').isDate(),
    validate
  ],
  analyticsController.getPaymentMethodBreakdown
);

router.get('/trend',
  auth,
  [
    query('days').optional().isInt({ min: 1, max: 365 }),
    validate
  ],
  analyticsController.getSpendingTrend
);

module.exports = router;
