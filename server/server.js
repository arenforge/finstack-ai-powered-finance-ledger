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
const mongoUri = process.env.MONGODB_DIRECT_URI || process.env.MONGODB_URI || process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/transactions', verifyFirebaseToken, transactionRoutes);
app.use('/api/goals', verifyFirebaseToken, goalRoutes);
app.use('/api/bills', verifyFirebaseToken, billRoutes);
app.use('/api/ai', verifyFirebaseToken, aiRoutes);
app.use('/api/shared-budgets', verifyFirebaseToken, sharedBudgetRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('MongoDB connected');
      startBillReminderJob();
      startRecurringTransactionJob();
    })
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
    });
} else {
  console.warn('MONGODB_URI is not set. API routes that need MongoDB will fail until server/.env is configured.');
}
