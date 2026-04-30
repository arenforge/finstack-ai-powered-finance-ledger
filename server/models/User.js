const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, unique: true, required: true },
  name: { type: String, default: '' },
  email: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  theme: { type: String, default: 'light' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
