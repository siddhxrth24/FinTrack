const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', [
  body('category').isString().notEmpty(),
  body('limit').isNumeric(),
  body('period').optional().isIn(['monthly','yearly'])
], budgetController.upsertBudget);

router.get('/', budgetController.getBudgets);

router.delete('/:id', param('id').isMongoId(), budgetController.deleteBudget);

module.exports = router;
