const nodemailer = require('nodemailer');
const eta = require('eta');

const etaEnv = require('../config').etaEnv;

const gmailTransporter = createTransporter();
const MAIL_SENDER = `"Kaschuso Benachrichtigungen 📢" <${process.env.GMAIL_USERNAME}>`;

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


async function getMail(email, mailSubject, html) {
    return {
        from: MAIL_SENDER,
        to: email,
        subject: mailSubject,
        html: html,
        attachments: [{
            filename: 'logo.jpg',
            path: './views/img/logo.jpg',
            cid: 'logo'
        }]
    };
}

async function sendGradeNotification(user, subjects) {
    try {
        const emoji = getEmoji(subjects);
        const html = await eta.renderFile('mail', {
            preheader: `Auf Kaschuso sind für ${subjects.map(x => x.name).join(', ')} neue Noten verfügbar ${emoji}`,
            pages: {
                main: 'grades'
            },
            env: etaEnv,
            user: user, 
            subjects: subjects,
            emoji: emoji
        });
        await gmailTransporter.sendMail(await getMail(user.email, 'Auf Kaschuso sind neue Noten verfügbar ❗', html));
        console.log('Grade Notification sent');
    } catch (e) {
        console.log(e);
    }
}

async function sendAbsenceNotification(user, absences) {
    try {
        const html = await eta.renderFile('mail', {
            preheader: 'Auf Kaschuso sind neue Absenzen verfügbar 🔔',
            title: 'Neue Absenzen🔔',
            pages: {
                main: 'absences'
            },
            env: etaEnv,
            user: user, 
            absences: absences
        });
        await gmailTransporter.sendMail(await getMail(user.email, 'Auf Kaschuso sind neue Absenzen verfügbar 🔔', html));
        console.log('Absence Notification sent');
    } catch (e) {
        console.log(e);
    }
}

async function sendWelcomeMail(user) {
    try {
        const html = await eta.renderFile('mail', {
            preheader: 'Kaschuso Benachrichtigungen sind aktiviert🎉',
            pages: {
                main: 'welcome'
            },
            env: etaEnv,
            user: user,
        });
        await gmailTransporter.sendMail(await getMail(user.email, 'Kaschuso Benachrichtigungen sind aktiviert🎉', html));
        console.log('Welcome Mail sent');
    } catch (e) {
        console.log(e);
    }
}

async function sendAbsenceReminder(user, absences) {
    try {
        const html = await eta.renderFile('mail', {
            preheader: 'Auf Kaschuso sind noch offene Absenzen ohne Grund eingetragen 🔔',
            title: 'Offene Absenzen ohne Grund🔔',
            pages: {
                main: 'absences'
            },
            env: etaEnv,
            user: user, 
            absences: absences
        });
        await gmailTransporter.sendMail(await getMail(user.email, 'Auf Kaschuso sind noch offene Absenzen ohne Grund eingetragen 🔔', html));
        console.log('Absence Reminder sent');
    } catch (e) {
        console.log(e);
    }
}

async function sendIftttWebhookError(user) {
    try {
        const html = await eta.renderFile('mail', {
            preheader: 'IFTTT Webhook schlägt fehl❌',
            title: 'IFTTT Webhook schlägt fehl❌',
            pages: {
                main: 'webhook-error'
            },
            env: etaEnv,
            user: user
        });
        await gmailTransporter.sendMail(await getMail(user.email, 'IFTTT Webhook schlägt fehl❌', html));
        console.log('Ifttt error sent');
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    sendWelcomeMail,
    sendGradeNotification,
    sendAbsenceNotification,
    sendAbsenceReminder,
    sendIftttWebhookError,
    // tests
    getEmoji,
};