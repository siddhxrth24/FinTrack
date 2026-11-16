const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', [
  body('name').isString().notEmpty(),
  body('type').isIn(['income', 'expense'])
], categoryController.createCategory);

router.get('/', categoryController.getCategories);

router.put('/:id', [
  param('id').isMongoId(),
  body('name').optional().isString().notEmpty(),
  body('type').optional().isIn(['income', 'expense'])
], categoryController.updateCategory);

router.delete('/:id', param('id').isMongoId(), categoryController.deleteCategory);

module.exports = router;
