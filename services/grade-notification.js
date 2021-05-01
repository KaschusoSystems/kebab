var mongoose = require('mongoose');
var User = mongoose.model('User');
var Subject = mongoose.model('Subject');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

const webhookTriggerName = 'kaschusosystems_notification_grade';

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
                await Promise.all((await updateSubjects(savedSubjects, changedSubjects, user))
                    .map(subject => subject.save()));
                
                if (user.iftttWebhookKey) {
                    webhook.triggerWebhook(user, webhookTriggerName, changedSubjects);
                }
            } else {
                console.log(`no new/changed grades for user ${user.username}`);
            }
        }));
    } catch (error) {
        console.log('Error during grade notification processing: ' + error);
        throw error;
    }
}

/**
 * This method does not save changes made to the subjects
 * 
 * @returns only the changed subjects
 */
async function updateSubjects(subjects, changedSubjects, user) {
    return await Promise.all(changedSubjects.map(async changedSubject => {
        const subject = findBySubject(subjects, changedSubject);
        if (subject) {
            return await mergeSubjectObject(subject, changedSubject);
        } else {
            return await user.addSubject(changedSubject);
        }
    }));
}

async function mergeSubjectObject(subject, changedSubject) {
    subject.average = changedSubject.average;
    await Promise.all(changedSubject.grades.map(async x => {
        const existingGrade = findByGrade(subject.grades, x);
        if (existingGrade) {
            Object.assign(existingGrade, x);
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
    return grades.find(x => x.name === grade.name && x.date === grade.date);
}

function findBySubject(subjects, subject) {
    return subjects.find(x => x.class === subject.class && x.name === subject.name);
}

function getChangedGrades(grades, newGrades) {
    return newGrades.filter(x => !grades
        .find(y => x.name === y.name && x.value == y.value)); // '5.5' shall be equal to 5.5 (string == number)
}

module.exports = {
    processGradeNotifications,
    getChangedGrades,
    getChangedSubjects,
    updateSubjects,
    mergeSubjectObject,
    findByGrade,
    findBySubject
}