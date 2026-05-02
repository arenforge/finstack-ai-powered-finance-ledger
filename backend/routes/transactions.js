const express = require('express');
const Transaction = require('../models/Transaction');
const { store, useMemoryStore, makeItem } = require('./devStore');

const router = express.Router();

const dayRange = (dateText) => {
  const start = new Date(`${dateText}T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};

const monthRange = (monthText) => {
  const start = new Date(`${monthText}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  return { start, end };
};

const totalsFrom = (items) => {
  const totalIncome = items.filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const totalExpense = items.filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
  return { totalIncome, totalExpense, net: totalIncome - totalExpense };
};

const categoryBreakdown = (items) => {
  const expenses = items.filter((item) => item.type === 'expense');
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const grouped = expenses.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total ? Math.round((amount / total) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);
};

const memoryTransactions = (userId) => store.transactions.filter((item) => item.userId === userId);

const applyMemoryFilters = (transactions, query) => {
  const { date, month, category, type, startDate, endDate, search, limit } = query;
  let result = [...transactions];

  if (date) {
    const { start, end } = dayRange(date);
    result = result.filter((item) => new Date(item.date) >= start && new Date(item.date) < end);
  } else if (month) {
    const { start, end } = monthRange(month);
    result = result.filter((item) => new Date(item.date) >= start && new Date(item.date) < end);
  } else if (startDate || endDate) {
    result = result.filter((item) => {
      const itemDate = new Date(item.date);
      if (startDate && itemDate < new Date(`${startDate}T00:00:00.000Z`)) return false;
      if (endDate && itemDate > new Date(`${endDate}T23:59:59.999Z`)) return false;
      return true;
    });
  }

  if (category) result = result.filter((item) => item.category === category);
  if (type) result = result.filter((item) => item.type === type);
  if (search) result = result.filter((item) => item.description.toLowerCase().includes(search.toLowerCase()));

  result.sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.createdAt) - new Date(a.createdAt));
  return limit ? result.slice(0, Number(limit)) : result;
};

router.get('/summary/daily', async (req, res) => {
  try {
    const date = req.query.date;
    if (!date) return res.status(400).json({ message: 'date is required.' });
    const { start, end } = dayRange(date);
    if (useMemoryStore()) {
      const transactions = memoryTransactions(req.user.uid).filter((item) => new Date(item.date) >= start && new Date(item.date) < end);
      return res.json(totalsFrom(transactions));
    }
    const transactions = await Transaction.find({ userId: req.user.uid, date: { $gte: start, $lt: end } });
    res.json(totalsFrom(transactions));
  } catch (error) {
    res.status(500).json({ message: 'Failed to load daily summary.' });
  }
});

router.get('/summary/monthly', async (req, res) => {
  try {
    const month = req.query.month;
    if (!month) return res.status(400).json({ message: 'month is required.' });
    const { start, end } = monthRange(month);
    if (useMemoryStore()) {
      const transactions = memoryTransactions(req.user.uid).filter((item) => new Date(item.date) >= start && new Date(item.date) < end);
      return res.json({ ...totalsFrom(transactions), categories: categoryBreakdown(transactions) });
    }
    const transactions = await Transaction.find({ userId: req.user.uid, date: { $gte: start, $lt: end } });
    res.json({ ...totalsFrom(transactions), categories: categoryBreakdown(transactions) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load monthly summary.' });
  }
});

router.get('/summary/all', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const transactions = memoryTransactions(req.user.uid).sort((a, b) => new Date(b.date) - new Date(a.date));
      const totals = totalsFrom(transactions);
      const savingsRate = totals.totalIncome ? Math.round((totals.net / totals.totalIncome) * 100) : 0;
      return res.json({ ...totals, savingsRate, categories: categoryBreakdown(transactions) });
    }
    const transactions = await Transaction.find({ userId: req.user.uid }).sort({ date: -1 });
    const totals = totalsFrom(transactions);
    const savingsRate = totals.totalIncome ? Math.round((totals.net / totals.totalIncome) * 100) : 0;
    res.json({ ...totals, savingsRate, categories: categoryBreakdown(transactions) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load all-time summary.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { date, month, category, type, startDate, endDate, search, limit } = req.query;
    if (useMemoryStore()) {
      return res.json(applyMemoryFilters(memoryTransactions(req.user.uid), req.query));
    }
    const filter = { userId: req.user.uid };

    if (date) {
      const range = dayRange(date);
      filter.date = { $gte: range.start, $lt: range.end };
    } else if (month) {
      const range = monthRange(month);
      filter.date = { $gte: range.start, $lt: range.end };
    } else if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(`${startDate}T00:00:00.000Z`);
      if (endDate) filter.date.$lte = new Date(`${endDate}T23:59:59.999Z`);
    }

    if (category) filter.category = category;
    if (type) filter.type = type;
    if (search) filter.description = { $regex: search, $options: 'i' };

    const query = Transaction.find(filter).sort({ date: -1, createdAt: -1 });
    if (limit) query.limit(Number(limit));
    const transactions = await query;
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load transactions.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { type, amount, category, description, date, isRecurring, recurringFrequency } = req.body;
    if (!['income', 'expense'].includes(type) || !amount || !category) {
      return res.status(400).json({ message: 'type, amount and category are required.' });
    }

    if (useMemoryStore()) {
      const transaction = makeItem({
        userId: req.user.uid,
        type,
        amount,
        category,
        description: description || '',
        date: date ? new Date(date) : new Date(),
        isRecurring: Boolean(isRecurring),
        recurringFrequency: isRecurring ? recurringFrequency : null
      });
      store.transactions.push(transaction);
      return res.status(201).json(transaction);
    }

    const transaction = await Transaction.create({
      userId: req.user.uid,
      type,
      amount,
      category,
      description: description || '',
      date: date ? new Date(date) : new Date(),
      isRecurring: Boolean(isRecurring),
      recurringFrequency: isRecurring ? recurringFrequency : null
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create transaction.' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const index = store.transactions.findIndex((item) => item._id === req.params.id && item.userId === req.user.uid);
      if (index === -1) return res.status(404).json({ message: 'Transaction not found.' });
      store.transactions[index] = { ...store.transactions[index], ...req.body };
      return res.json(store.transactions[index]);
    }
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.uid },
      req.body,
      { new: true, runValidators: true }
    );
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update transaction.' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const index = store.transactions.findIndex((item) => item._id === req.params.id && item.userId === req.user.uid);
      if (index === -1) return res.status(404).json({ message: 'Transaction not found.' });
      store.transactions.splice(index, 1);
      return res.json({ message: 'Transaction deleted.' });
    }
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ message: 'Transaction deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete transaction.' });
  }
});

module.exports = router;
