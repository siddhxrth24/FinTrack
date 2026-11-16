const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// Create category
exports.createCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, type } = req.body;
  try {
    const category = new Category({ user: req.user.id, name, type });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all categories for user
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id }).sort({ type: 1, name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const { name, type } = req.body;
  try {
    const category = await Category.findOne({ _id: id, user: req.user.id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    category.name = name ?? category.name;
    category.type = type ?? category.type;
    await category.save();
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findOneAndDelete({ _id: id, user: req.user.id });
    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
