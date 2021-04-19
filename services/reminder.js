var mongoose = require('mongoose');
var User = mongoose.model('User');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

async function processAbsenceReminders() {
    console.log('Processing absence reminders...');
    try {
        const users = await User.find({ absenceReminders: true });
        console.log(`${users.length} users found for absence reminders`);

        await Promise.all(users.map(async (user) => {
            const absences = await kaschusoApi.scrapeAbsences(user);
        }));
    } catch (error) {
        console.log('Error during absence reminders processing: ' + error);
    }
}

module.exports = {
    processAbsenceReminders
}