const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  period: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
  // periodStart could be used for custom periods
  periodStart: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Budget', budgetSchema);
