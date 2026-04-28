const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true, index: true },
  isPaid: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Bill', billSchema);
