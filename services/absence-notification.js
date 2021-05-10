var mongoose = require('mongoose');
var User = mongoose.model('User');
var Absence = mongoose.model('Absence');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

const webhookTriggerName = 'kaschusosystems_notification_absence';

async function processAbsenceNotifications() {
    console.log('Processing absence notifications...');
    try {
        const users = await User.find({ absenceNotifications: true });
        console.log(`${users.length} users found for absence notifications`);

        await Promise.all(users.map(async (user) => {
            try {
                const newAbsences = await kaschusoApi.scrapeAbsences(user);
                const savedAbsences = await Absence.find({'user': user.id});
                
                const [changedAbsences, changedAbsencesToNotify] = await getChangedAbsences(Object.assign(savedAbsences, {}), newAbsences);

                if (changedAbsences.length !== 0) {
                    await Promise.all((await updateAbsences(savedAbsences, changedAbsences, user))
                        .map(absence => absence.save()));
                }
    
                if (changedAbsencesToNotify.length !== 0) {
                    console.log(`${changedAbsencesToNotify.length} new/changed absence(s) for user ${user.username}`);
                    await gmail.sendAbsenceNotification(user, changedAbsencesToNotify);
                    
                    if (user.iftttWebhookKey) {
                        webhook.triggerWebhook(user.iftttWebhookKey, webhookTriggerName, changedAbsencesToNotify);
                    }
                } else {
                    console.log(`no new/changed absences for user ${user.username}`);
                }
            } catch (err) {
                console.error(`error during absence reminder processing for user ${user.username}: ${err}`);
            }
        }));
    } catch (error) {
        console.error('Error during absence notification processing: ' + error);
        throw error;
    }
}

 async function updateAbsences(absences, changedAbsences, user) {
    return await Promise.all(changedAbsences.map(async changedAbsence => {
        const absence = findByAbsence(absences, changedAbsence);
        if (absence) {
            Object.assign(absence, changedAbsence);
            return absence;
        } else {
            return await user.addAbsence(changedAbsence);
        }
    }));
}

function getChangedAbsences(absences, newAbsences) {
    const changedAbsences = [];
    const changedAbsencesToNotify = [];
    newAbsences.map(newAbsence => {
        const absence = findByAbsence(absences, newAbsence);
        if (absence) {
            if (!(absence.status   === newAbsence.status 
                && absence.comment === newAbsence.comment
                && absence.reason  === newAbsence.reason)) {
                const changedAbsence = Object.assign(absence, newAbsence);
                changedAbsences.push(changedAbsence);
            }
        } else {
            changedAbsences.push(newAbsence);
            changedAbsencesToNotify.push(newAbsence);
        }
    });
    return [changedAbsences, changedAbsencesToNotify];
}

function findByAbsence(absences, absence) {
    return absences.find(x => x.date  === absence.date
                           && x.time  === absence.time
                           && x.class === absence.class);
}

module.exports = {
    processAbsenceNotifications,
    // tests
    updateAbsences,
    getChangedAbsences,
    findByAbsence
}