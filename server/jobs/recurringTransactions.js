const schedule = require('node-schedule');
const Transaction = require('../models/Transaction');

function shouldRunToday(transaction, today) {
  const original = new Date(transaction.date);
  if (transaction.recurringFrequency === 'daily') return true;

  if (transaction.recurringFrequency === 'weekly') {
    return original.getDay() === today.getDay();
  }

  if (transaction.recurringFrequency === 'monthly') {
    return original.getDate() === today.getDate();
  }

  return false;
}

function startRecurringTransactionJob() {
  schedule.scheduleJob('0 0 * * *', async () => {
    try {
      const today = new Date();
      const start = new Date(today);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);

      const recurring = await Transaction.find({ isRecurring: true });

      for (const transaction of recurring) {
        if (!shouldRunToday(transaction, today)) continue;

        // Avoid duplicate auto-created entries if the server restarts around midnight.
        const existing = await Transaction.findOne({
          userId: transaction.userId,
          description: transaction.description,
          amount: transaction.amount,
          category: transaction.category,
          date: { $gte: start, $lt: end },
          isRecurring: false
        });

        if (existing) continue;

        await Transaction.create({
          userId: transaction.userId,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: today
        });
        console.log(`AUTO: Created recurring transaction ${transaction.description} ₹${transaction.amount}`);
      }
    } catch (error) {
      console.error('Recurring transaction job failed:', error.message);
    }
  });
}

module.exports = startRecurringTransactionJob;
