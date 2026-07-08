const express = require('express');
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const { validate } = require('../middleware/validation');

const router = express.Router();

router.get('/', auth, categoryController.getCategories);

router.post('/',
  auth,
  [
    body('name').trim().notEmpty(),
    body('type').isIn(['income', 'expense', 'transfer']),
    body('color').optional().trim(),
    body('icon').optional().trim(),
    body('emoji').optional().trim(),
    body('budget').optional().isFloat({ min: 0 }),
    body('description').optional().trim(),
    validate
  ],
  categoryController.createCategory
);

router.put('/:id',
  auth,
  [
    param('id').isInt(),
    body('name').optional().trim().notEmpty(),
    body('type').optional().isIn(['income', 'expense', 'transfer']),
    body('color').optional().trim(),
    body('icon').optional().trim(),
    body('emoji').optional().trim(),
    body('budget').optional().isFloat({ min: 0 }),
    body('description').optional().trim(),
    validate
  ],
  categoryController.updateCategory
);

router.delete('/:id',
  auth,
  [
    param('id').isInt(),
    validate
  ],
  categoryController.deleteCategory
);

module.exports = router;
