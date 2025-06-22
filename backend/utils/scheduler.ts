import cron from 'node-cron';
import {notificationService} from "../controllers/notificationService";

// Run every day at 9 AM to send deadline reminders
cron.schedule('0 9 * * *', async () => {
    console.log('Running deadline reminder task...');
    await notificationService.sendDeadlineReminders();
});

export default cron;