require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const verifyFirebaseToken = require('./middleware/verifyFirebaseToken');
const transactionRoutes = require('./routes/transactions');
const goalRoutes = require('./routes/goals');
const billRoutes = require('./routes/bills');
const aiRoutes = require('./routes/ai');
const sharedBudgetRoutes = require('./routes/sharedBudgets');
const startBillReminderJob = require('./jobs/billReminder');
const startRecurringTransactionJob = require('./jobs/recurringTransactions');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/transactions', verifyFirebaseToken, transactionRoutes);
app.use('/api/goals', verifyFirebaseToken, goalRoutes);
app.use('/api/bills', verifyFirebaseToken, billRoutes);
app.use('/api/ai', verifyFirebaseToken, aiRoutes);
app.use('/api/shared-budgets', verifyFirebaseToken, sharedBudgetRoutes);

mongoose
  .connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('MongoDB connected');
    startBillReminderJob();
    startRecurringTransactionJob();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
