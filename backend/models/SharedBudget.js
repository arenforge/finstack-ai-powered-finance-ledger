const mongoose = require('mongoose');

const sharedBudgetSchema = new mongoose.Schema({
  ownerId: { type: String, required: true, index: true },
  memberId: { type: String, required: true, index: true },
  role: { type: String, enum: ['owner', 'viewer'], required: true },
  budgetLimit: { type: Number, required: true, min: 0 },
  month: { type: String, required: true }
});

module.exports = mongoose.model('SharedBudget', sharedBudgetSchema);
