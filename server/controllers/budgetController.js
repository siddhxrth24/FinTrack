const Budget = require('../models/Budget');
const { validationResult } = require('express-validator');

// Create or update budget for a category
exports.upsertBudget = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { category, limit, period } = req.body;
  try {
    let budget = await Budget.findOne({ user: req.user.id, category });
    if (budget) {
      budget.limit = limit ?? budget.limit;
      budget.period = period ?? budget.period;
      await budget.save();
    } else {
      budget = new Budget({ user: req.user.id, category, limit, period });
      await budget.save();
    }
    res.status(200).json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all budgets for user
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a budget
exports.deleteBudget = async (req, res) => {
  const { id } = req.params;
  try {
    const budget = await Budget.findOneAndDelete({ _id: id, user: req.user.id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
