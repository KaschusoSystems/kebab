var mongoose = require('mongoose');
var User = mongoose.model('User');
var Absence = mongoose.model('Absence');

const webhook = require('./webhook');
const gmail = require('./gmail');

const webhookTriggerName = 'kaschusosystems_reminder_absence';

async function processAbsenceReminders() {
    logger.info('absence-reminder.process.started');
    
    const users = await User.find({ absenceReminders: true });
    logger.info(`absence-reminder.process.usersFound.${users.length}`);

    const time = new Date().getTime() - 12 * 60 * 60 * 1000; // send notifications max every 12 hours

    await Promise.all(users.map(async user => {
        try {
            const absences = await Absence.find({'user': user.id, lastNotification: {$lt: time}, status: 'offen', reason: null });
            logger.debug(`absence-reminder.process.user-${user.username}.openAbsencesFound.${absences.length}`);

            if (absences && absences.length > 0) {
                await gmail.sendAbsenceReminder(user, absences);
                
                // Update notifiedNow
                await Promise.all(absences.map(absence => absence.notifiedNow().save()));
                
                if (user.iftttWebhookKey) {
                    webhook.triggerWebhook(user, webhookTriggerName, absences);
                }
            }
        } catch (err) {
            logger.error(`absence-reminder.process.user-${user.username}: ${err}`);
        }
    }));
}

module.exports = {
    processAbsenceReminders
}