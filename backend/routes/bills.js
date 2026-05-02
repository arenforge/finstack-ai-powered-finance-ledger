const express = require('express');
const Bill = require('../models/Bill');
const { store, useMemoryStore, makeItem } = require('./devStore');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (useMemoryStore()) {
      return res.json(store.bills.filter((bill) => bill.userId === req.user.uid).sort((a, b) => Number(a.isPaid) - Number(b.isPaid) || new Date(a.dueDate) - new Date(b.dueDate)));
    }
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
    if (useMemoryStore()) {
      const bill = makeItem({ userId: req.user.uid, title, amount, dueDate, isPaid: false, reminderSent: false });
      store.bills.push(bill);
      return res.status(201).json(bill);
    }
    const bill = await Bill.create({ userId: req.user.uid, title, amount, dueDate });
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create bill.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const index = store.bills.findIndex((bill) => bill._id === req.params.id && bill.userId === req.user.uid);
      if (index === -1) return res.status(404).json({ message: 'Bill not found.' });
      store.bills[index] = { ...store.bills[index], ...req.body };
      return res.json(store.bills[index]);
    }
    const bill = await Bill.findOneAndUpdate({ _id: req.params.id, userId: req.user.uid }, req.body, { new: true, runValidators: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bill.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const index = store.bills.findIndex((bill) => bill._id === req.params.id && bill.userId === req.user.uid);
      if (index === -1) return res.status(404).json({ message: 'Bill not found.' });
      store.bills.splice(index, 1);
      return res.json({ message: 'Bill deleted.' });
    }
    const bill = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!bill) return res.status(404).json({ message: 'Bill not found.' });
    res.json({ message: 'Bill deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete bill.' });
  }
});

module.exports = router;
