var mongoose = require('mongoose');
var User = mongoose.model('User');
var Absence = mongoose.model('Absence');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

const webhookTriggerName = 'kaschusosystems_reminder_absence';

async function processAbsenceReminders() {
    console.log('Processing absence reminders...');
    try {
        const users = await User.find({ absenceReminders: true });
        console.log(`${users.length} users found for absence reminders`);

        const time = new Date().getTime() - 12*60*60*1000; // send notifications max every 12 hours

        await Promise.all(users.map(async user => {
            const absences = await Absence.find({'user': user.id, lastNotification: {$lt: time}, status: 'offen', reason: null });
            
            if (absences && absences.length > 0) {
                console.log(`${absences.length} open absence(s) without a reason for user ${user.username}`);
                await gmail.sendAbsenceReminder(user, absences);
                
                // Update notifiedNow
                await Promise.all(absences.map(absence => absence.notifiedNow().save()));
                
                if (user.iftttWebhookKey) {
                    webhook.triggerWebhook(user.iftttWebhookKey, webhookTriggerName, absences);
                }
            } else {
                console.log(`no absences to remind for user ${user.username}`);
            }
        }));
    } catch (error) {
        console.log('Error during absence reminders processing: ' + error);
    }
}

module.exports = {
    processAbsenceReminders
}