const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findOne({ uid: req.user.uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user settings
router.put('/settings', async (req, res) => {
  try {
    const { currency, theme } = req.body;
    const user = await User.findOneAndUpdate(
      { uid: req.user.uid },
      { $set: { currency, theme } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
