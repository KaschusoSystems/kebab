const cron = require('node-cron');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Subject = mongoose.model('Subject');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

async function processGradeNotifications() {
    console.log('Processing grade notifications...');
    try {
        const users = await User.find({ gradeNotifications: true });
        console.log(`${users.length} users found for grade notifications`);

        await Promise.all(users.map(async (user) => {
            const newSubjects = await kaschusoApi.scrapeGrades(user);
            const savedSubjects = await Subject.find({'user': user.id});
            
            const changedSubjects = await getChangedSubjects(Object.assign(savedSubjects, {}), newSubjects);
            const hasChanges = changedSubjects.length !== 0;

            if (hasChanges) {
                console.log(`new/changed grades in ${changedSubjects.length} subject(s) for user ${user.username}`);
                await gmail.sendGradeNotification(user, changedSubjects);
                
                // Only update db if changes detected
                await updateSubjects(savedSubjects, changedSubjects, user);
                
                if (user.webhookUri) {
                    webhook.triggerWebhook(user.webhookUri, changedSubjects);
                }
            } else {
                console.log(`no new/changed grades for user ${user.username}`);
            }
        }));
    } catch (error) {
        console.log('Error during notifications processing: ' + error);
        throw error;
    }
}

async function updateSubjects(subjects, changedSubjects, user) {
    await Promise.all(changedSubjects.map(async changedSubject => {
        const subject = findBySubject(subjects, changedSubject);
        if (subject) {
            await mergeSubjectObject(subject, changedSubject);
        } else {
            const newSubject = await user.addSubject(changedSubject);
            subjects.push(newSubject);
        }
    }));
    return subjects;
}

async function mergeSubjectObject(subject, changedSubject) {
    subject.average = changedSubject.average;
    await Promise.all(changedSubject.grades.map(async x => {
        const existingGrade = findByGrade(subject.grades, x);
        if (existingGrade) {
            Object.assign(existingGrade, x);
            await subject.save();
        } else {
            await subject.addGrade(x);
        }
    }));
    return subject;
}

function getChangedSubjects(subjects, newSubjects) {
    const changedSubjects = [];
    newSubjects.map(newSubject => {
        const subject = findBySubject(subjects, newSubject);
        if (subject) {
            const changedGrades = getChangedGrades(subject.grades, newSubject.grades);
            if (changedGrades && changedGrades.length > 0) {
                const changedSubject = Object.assign(newSubject, {});
                changedSubject.grades = changedGrades;
                changedSubjects.push(changedSubject);
            }
        } else {
            changedSubjects.push(newSubject);
        }
    });
    return changedSubjects;
}

function findByGrade(grades, grade) {
    return grades.find(x => x.title === grade.title && x.date === grade.date);
}

function findBySubject(subjects, subject) {
    return subjects.find(x => x.class === subject.class && x.name === subject.name);
}

function getChangedGrades(grades, newGrades) {
    return newGrades.filter(x => !grades
        .find(y => x.title === y.title && x.value == y.value)); // '5.5' shall be equal to 5.5 (string == number)
}

if (process.env.NODE_ENV !== 'test') {
    processGradeNotifications()
    // move to scheduler
    // Every minute
    cron.schedule('* * * * *', processGradeNotifications);
}

module.exports = {
    getChangedGrades,
    getChangedSubjects,
    updateSubjects,
    mergeSubjectObject,
    findByGrade,
    findBySubject
}