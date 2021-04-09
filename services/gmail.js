const nodemailer = require("nodemailer");

const gmailTransporter = createTransporter();
const MAIL_SENDER = `"Kaschuso Notifications 📢" <${process.env.GMAIL_USERNAME}>`;
const MAIL_SUBJECT = 'You have new grades in your Kaschuso ❗';
const KASCHUSO_BASE_URL = 'https://kaschuso.so.ch/';

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

function createGradeNotificationText(user, grades) {
    let body = '<h2>Your latest grades available for confirmation:</h2><hr>'

    body += JSON.stringify(grades);
    /*
    grades = grades.sort((a, b) => +a.value - +b.value);
    grades.forEach(grade => {
        body += `<h3>${grade.title}: ${grade.value}</h3>`;
        body += `<h4>${grade.subject}</h4>`;
        body += '<br>';
    });
    */

    body += `<hr><a href="${KASCHUSO_BASE_URL + user.mandator}">Confirm your grades here 👀</a>`;
    return body;
}

async function sendGradeNotification(user, grades) {
    try {
        await gmailTransporter.sendMail({
            from: MAIL_SENDER,
            to: user.email,
            subject: MAIL_SUBJECT,
            html: createGradeNotificationText(user, grades)
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