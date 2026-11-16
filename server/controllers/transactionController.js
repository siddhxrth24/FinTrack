const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Create transaction
exports.createTransaction = async (req, res) => {
  // validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, amount, type, category, date } = req.body;
  try {
    const transaction = new Transaction({
      user: req.user.id,
      name,
      amount,
      type,
      category,
      date
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all transactions for authenticated user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { id } = req.params;
  const { name, amount, type, category, date } = req.body;
  try {
    const transaction = await Transaction.findOne({ _id: id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    transaction.name = name ?? transaction.name;
    transaction.amount = amount ?? transaction.amount;
    transaction.type = type ?? transaction.type;
    transaction.category = category ?? transaction.category;
    transaction.date = date ?? transaction.date;
    await transaction.save();
    res.json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: id, user: req.user.id });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
