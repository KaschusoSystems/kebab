const nodemailer = require('nodemailer');
const eta = require('eta');

const etaEnv = require('../config').etaEnv;

const gmailTransporter = createTransporter();
const MAIL_SENDER = `"Kaschuso Benachrichtigungen 📢" <${process.env.GMAIL_USERNAME}>`;
const MAIL_SUBJECT = 'Auf Kaschuso sind neue Noten verfügbar ❗';

function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {
            user: process.env.GMAIL_USERNAME,
            pass: process.env.GMAIL_PASSWORD,
        },
    });
}

function getEmoji(subjects) {
    const gradeValues = subjects.flatMap(subject => subject.grades)
        .map(grade => parseInt(grade.value));

    const average = gradeValues.reduce((a, b) => a + b) / gradeValues.length;
    if (average >= 6) {
        return '😎';
    } else if (average >= 5) {
        return '😊';
    } else if (average >= 4) {
        return '😉';
    } else if (average >= 3) {
        return '🧐';
    } else if (average >= 2) {
        return '😳';
    } else {
        return '😨';
    }
}

async function renderGradeNotificationHtml(env, user, subjects) {
    const emoji = getEmoji(subjects);
    return await eta.renderFile('mail', {
        preheader: `Auf Kaschuso sind für ${subjects.map(x => x.name).join(', ')} neue Noten verfügbar${emoji}`,
        pages: {
            main: 'grades'
        },
        env: env,
        user: user, 
        subjects: subjects,
        emoji: emoji
    });
}

async function getGradeMail(user, subjects) {
    return {
        from: MAIL_SENDER,
        to: user.email,
        subject: MAIL_SUBJECT,
        html: await renderGradeNotificationHtml(etaEnv, user, subjects),
        attachments: [{
            filename: 'logo.jpg',
            path: './views/img/logo.jpg',
            cid: 'logo'
        }]
    };
}

async function sendGradeNotification(user, subjects) {
    try {
        await gmailTransporter.sendMail(await getGradeMail(user, subjects));
        console.log('Notification sent');
    } catch (e) {
        console.log(e);
    }
}

// TODO: Absence reminders
async function sendAbsenceReminder(user, absences) {

}

module.exports = {
    sendGradeNotification,
    sendAbsenceReminder,
    // tests
    getEmoji,
    renderGradeNotificationHtml,
};