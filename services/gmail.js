const nodemailer = require("nodemailer");
const eta = require("eta")

const gmailTransporter = createTransporter();
const MAIL_SENDER = `"Kaschuso Notifications 📢" <${process.env.GMAIL_USERNAME}>`;
const MAIL_SUBJECT = 'You have new grades in your Kaschuso ❗';
const KASCHUSO_BASE_URL = process.env.KASCHUSO_BASE_URL || 'https://kaschuso.so.ch/';

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

async function createGradeNotificationText(user, subjects) {
    return await eta.renderFile("./grades", { 
        env: {
            kaschuso: (process.env.KASCHUSO_BASE_URL || 'https://kaschuso.so.ch/') + user.mandator,
            gyros: 'http://localhost/' // add gyros environment var
        },
        user: user, 
        subjects: subjects 
    });
}

async function sendGradeNotification(user, subjects) {
    try {
        await gmailTransporter.sendMail({
            from: MAIL_SENDER,
            to: user.email,
            subject: MAIL_SUBJECT,
            html: await createGradeNotificationText(user, subjects)
        });
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
    sendAbsenceReminder
};