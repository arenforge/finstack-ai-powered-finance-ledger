const express = require('express');
const Bill = require('../models/Bill');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find({ userId: req.user.uid }).sort({ isPaid: 1, dueDate: 1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load bills.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, amount, dueDate } = req.body;
    if (!title || !amount || !dueDate) return res.status(400).json({ message: 'title, amount and dueDate are required.' });
    const bill = await Bill.create({ userId: req.user.uid, title, amount, dueDate });
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bill.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const bill = await Bill.findOneAndUpdate({ _id: req.params.id, userId: req.user.uid }, req.body, { new: true, runValidators: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bill.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json({ message: 'Bill deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bill.' });
  }
});

module.exports = router;
