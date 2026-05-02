const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  amount: { type: Number, required: true, min: 0 },
  category: { type: String, required: true },
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now, index: true },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', null], default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
