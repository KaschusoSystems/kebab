const cron = require('node-cron');

const { processGradeNotifications } = require('./grade-notification');
const { processAbsenceNotifications } = require('./absence-notification');
const { processAbsenceReminders } = require('./absence-reminder');
const logger = require('../domain/logger');

// do not send notifications when running tests
if (process.env.NODE_ENV !== 'test') {
    // initial call
    processGradeNotifications();
    processAbsenceNotifications();
    processAbsenceReminders();

    // default: Every minute
    cron.schedule(process.env.GRADE_NOTIFICATION_CRON_STRING   || '* * * * *', processGradeNotifications);
    // default: Every day at midnight
    cron.schedule(process.env.ABSENCE_NOTIFICATION_CRON_STRING || '0 0 * * *', processAbsenceNotifications);
    // default: Every day at midnight
    cron.schedule(process.env.ABSENCE_REMINDER_CRON_STRING     || '0 0 * * *', processAbsenceReminders);

    logger.info('scheduler.jobsScheduled');
}