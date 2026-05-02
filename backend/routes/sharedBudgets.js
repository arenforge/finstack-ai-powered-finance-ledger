const express = require('express');
const SharedBudget = require('../models/SharedBudget');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { store, useMemoryStore, makeItem } = require('./devStore');

const router = express.Router();

async function withUsage(budget) {
  const start = new Date(`${budget.month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  const spent = useMemoryStore()
    ? store.transactions.filter((item) => item.userId === budget.ownerId && item.type === 'expense' && new Date(item.date) >= start && new Date(item.date) < end).reduce((sum, item) => sum + item.amount, 0)
    : (await Transaction.aggregate([
      { $match: { userId: budget.ownerId, type: 'expense', date: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]))[0]?.total || 0;
  const item = budget.toObject ? budget.toObject() : budget;
  return { ...item, spent, percentageUsed: item.budgetLimit ? Math.round((spent / item.budgetLimit) * 100) : 0 };
}

router.get('/', async (req, res) => {
  try {
    if (useMemoryStore()) {
      const budgets = store.sharedBudgets.filter((budget) => budget.ownerId === req.user.uid || budget.memberId === req.user.uid);
      const enriched = await Promise.all(budgets.map(withUsage));
      return res.json(enriched.map((budget) => ({ ...budget, role: budget.ownerId === req.user.uid ? 'owner' : 'viewer' })));
    }
    const budgets = await SharedBudget.find({ $or: [{ ownerId: req.user.uid }, { memberId: req.user.uid }] }).sort({ month: -1 });
    const enriched = await Promise.all(budgets.map(withUsage));
    res.json(enriched.map((budget) => ({ ...budget, role: budget.ownerId === req.user.uid ? 'owner' : 'viewer' })));
  } catch (error) {
    res.status(500).json({ message: 'Failed to load shared budgets.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, budgetLimit, month } = req.body;
    if (!email || !budgetLimit || !month) return res.status(400).json({ message: 'email, budgetLimit and month are required.' });
    if (useMemoryStore()) {
      const budget = makeItem({ ownerId: req.user.uid, memberId: 'demo-member', role: 'viewer', budgetLimit, month, email });
      store.sharedBudgets.push(budget);
      return res.status(201).json(await withUsage(budget));
    }
    const member = await User.findOne({ email });
    if (!member) return res.status(404).json({ message: 'User with that email was not found.' });
    const budget = await SharedBudget.create({
      ownerId: req.user.uid,
      memberId: member.uid,
      role: 'viewer',
      budgetLimit,
      month
    });
    res.status(201).json(await withUsage(budget));
  } catch (error) {
    res.status(500).json({ message: 'Failed to share budget.' });
  }
});

module.exports = router;
