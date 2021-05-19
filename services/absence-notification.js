var mongoose = require('mongoose');
var User = mongoose.model('User');
var Absence = mongoose.model('Absence');

const logger = require('../domain/logger');
const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

const webhookTriggerName = 'kaschusosystems_notification_absence';

async function processAbsenceNotifications() {
    logger.info('absence-notification.process.started');
    try {
        const users = await User.find({ absenceNotifications: true });
        logger.debug(`absence-notification.process.usersFound.${users.length}`);

        await Promise.all(users.map(async (user) => {
            try {
                const newAbsences = await kaschusoApi.scrapeAbsences(user);
                const savedAbsences = await Absence.find({'user': user.id});
                
                const [changedAbsences, changedAbsencesToNotify] = await getChangedAbsences(Object.assign(savedAbsences, {}), newAbsences);

                if (changedAbsences.length !== 0) {
                    await Promise.all((await updateAbsences(savedAbsences, changedAbsences, user))
                        .map(absence => absence.save()));
                }
    
                logger.debug(`absence-notification.process.user-${user.username}.absencesFound.${changedAbsencesToNotify.length}`);
                if (changedAbsencesToNotify.length !== 0) {
                    

                    await gmail.sendAbsenceNotification(user, changedAbsencesToNotify);

                    if (user.iftttWebhookKey) {
                        webhook.triggerWebhook(user, webhookTriggerName, changedAbsences);
                    }
                }
            } catch (err) {
                logger.error(`absence-notification.process.user-${user.username}: ${err}`);
            }
        }));
    } catch (error) {
        logger.error(`absence-notification.process: ${error}`);
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