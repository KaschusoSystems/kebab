const cron = require('node-cron');

const { processGradeNotifications } = require('./grade-notification');
const { processAbsenceNotifications } = require('./absence-notification');
const { processAbsenceReminders } = require('./absence-reminder');

// do not send notifications when running tests
if (process.env.NODE_ENV !== 'test') {
    // initial call
    processGradeNotifications();
    processAbsenceNotifications();

    // default: Every minute
    cron.schedule(process.env.GRADE_NOTIFICATION_CRON_STRING || '* * * * *', processGradeNotifications);
    // default: Every day at midnight
    cron.schedule(process.env.ABSENCE_NOTIFICATION_CRON_STRING || '0 0 * * *', processAbsenceNotifications);
}