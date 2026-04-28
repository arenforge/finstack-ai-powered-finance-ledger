const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Transaction = require('../models/Transaction');

const router = express.Router();

function summarizeTransactions(transactions) {
  const categoryTotals = {};
  const monthlyTotals = {};

  transactions.forEach((item) => {
    const month = item.date.toISOString().slice(0, 7);
    if (!monthlyTotals[month]) monthlyTotals[month] = { income: 0, expense: 0, net: 0 };
    monthlyTotals[month][item.type] += item.amount;
    monthlyTotals[month].net = monthlyTotals[month].income - monthlyTotals[month].expense;

    if (item.type === 'expense') {
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.amount;
    }
  });

  return { categoryTotals, monthlyTotals };
}

router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) return res.status(400).json({ message: 'question is required.' });
    if (!process.env.GEMINI_API_KEY) return res.status(500).json({ message: 'Gemini API key is not configured.' });

    const start = new Date();
    start.setMonth(start.getMonth() - 3);
    const transactions = await Transaction.find({ userId: req.user.uid, date: { $gte: start } }).sort({ date: -1 });
    const summary = summarizeTransactions(transactions);

    const systemPrompt = `You are a personal finance assistant. The user logs their daily expenses and income.
Their summarized financial data is provided below. Answer their question based only
on this data. Be concise, friendly, and specific with numbers. Use ₹ as currency symbol.`;

    // The model sees only compact aggregates, which keeps private diary descriptions out unless needed.
    const prompt = `${systemPrompt}

Financial data:
${JSON.stringify(summary, null, 2)}

Question: ${question}`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const answer = result.response.text();
    res.json({ answer });
  } catch (error) {
    console.error('AI query failed:', error.message);
    res.status(500).json({ message: 'Failed to generate AI response.' });
  }
});

module.exports = router;
