const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  targetAmount: { type: Number, required: true, min: 0 },
  savedAmount: { type: Number, default: 0, min: 0 },
  deadline: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', goalSchema);
