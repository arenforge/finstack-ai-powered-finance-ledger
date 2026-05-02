const express = require('express');
const Goal = require('../models/Goal');
const { store, useMemoryStore, makeItem } = require('./devStore');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (useMemoryStore()) {
      return res.json(store.goals.filter((goal) => goal.userId === req.user.uid).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)));
    }
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
    if (useMemoryStore()) {
      const goal = makeItem({ userId: req.user.uid, title, targetAmount, savedAmount: savedAmount || 0, deadline });
      store.goals.push(goal);
      return res.status(201).json(goal);
    }
    const goal = await Goal.create({ userId: req.user.uid, title, targetAmount, savedAmount: savedAmount || 0, deadline });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create goal.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const index = store.goals.findIndex((goal) => goal._id === req.params.id && goal.userId === req.user.uid);
      if (index === -1) return res.status(404).json({ message: 'Goal not found.' });
      store.goals[index] = { ...store.goals[index], ...req.body };
      return res.json(store.goals[index]);
    }
    const goal = await Goal.findOneAndUpdate({ _id: req.params.id, userId: req.user.uid }, req.body, { new: true, runValidators: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update goal.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const index = store.goals.findIndex((goal) => goal._id === req.params.id && goal.userId === req.user.uid);
      if (index === -1) return res.status(404).json({ message: 'Goal not found.' });
      store.goals.splice(index, 1);
      return res.json({ message: 'Goal deleted.' });
    }
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!goal) return res.status(404).json({ message: 'Goal not found.' });
    res.json({ message: 'Goal deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete goal.' });
  }
});

module.exports = router;
