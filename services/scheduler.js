const cron = require('node-cron');

const { processGradeNotifications } = require('./grade-notification');
const { processAbsenceReminders   } = require('./reminder');

// do not send notifications when running tests
if (process.env.NODE_ENV !== 'test') {
    // initiall call
    processGradeNotifications();
    processAbsenceReminders();

    // default: Every minute
    cron.schedule(process.env.GRADE_NOTIFICATION_CRON_STRING || '* * * * *', processGradeNotifications);
    // default: Every day at midnight
    cron.schedule(process.env.ABSENCE_REMINDER_CRON_STRING || '0 0 * * *', processAbsenceReminders);
}