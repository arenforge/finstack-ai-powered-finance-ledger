const schedule = require('node-schedule');
const Bill = require('../models/Bill');

function startBillReminderJob() {
  schedule.scheduleJob('0 9 * * *', async () => {
    try {
      const now = new Date();
      const soon = new Date(now);
      soon.setDate(soon.getDate() + 3);

      // Reminders are logged once per bill so a future email/SMS worker can reuse the same flag.
      const bills = await Bill.find({
        isPaid: false,
        reminderSent: false,
        dueDate: { $gte: now, $lte: soon }
      });

      for (const bill of bills) {
        console.log(`REMINDER: Bill ${bill.title} of ₹${bill.amount} due on ${bill.dueDate.toISOString().slice(0, 10)}`);
        bill.reminderSent = true;
        await bill.save();
      }
    } catch (error) {
      console.error('Bill reminder job failed:', error.message);
    }
  });
}

module.exports = startBillReminderJob;
