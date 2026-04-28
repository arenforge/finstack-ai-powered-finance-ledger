const express = require('express');
const Goal = require('../models/Goal');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.uid }).sort({ deadline: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load goals.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, targetAmount, savedAmount, deadline } = req.body;
    if (!title || !targetAmount || !deadline) return res.status(400).json({ message: 'title, targetAmount and deadline are required.' });
    const goal = await Goal.create({ userId: req.user.uid, title, targetAmount, savedAmount: savedAmount || 0, deadline });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.user.uid }, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ message: 'Goal deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete goal.' });
  }
});

module.exports = router;
