const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const transactionController = require('../controllers/transactionController');
const auth = require('../middleware/auth');

// Validation rules
const transactionValidators = [
  body('name').isString().notEmpty(),
  body('amount').isNumeric(),
  body('type').isIn(['income', 'expense']),
  body('category').isString().notEmpty(),
  body('date').isISO8601()
];

router.use(auth);

router.post('/', transactionValidators, transactionController.createTransaction);
router.get('/', transactionController.getTransactions);
router.put('/:id', [param('id').isMongoId(), ...transactionValidators], transactionController.updateTransaction);
router.delete('/:id', param('id').isMongoId(), transactionController.deleteTransaction);

module.exports = router;
