const express = require('express');
const SharedBudget = require('../models/SharedBudget');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();

async function withUsage(budget) {
  const start = new Date(`${budget.month}-01T00:00:00.000Z`);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  const ownerSpend = await Transaction.aggregate([
    { $match: { userId: budget.ownerId, type: 'expense', date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const spent = ownerSpend[0]?.total || 0;
  const item = budget.toObject();
  return { ...item, spent, percentageUsed: item.budgetLimit ? Math.round((spent / item.budgetLimit) * 100) : 0 };
}

router.get('/', async (req, res) => {
  try {
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
