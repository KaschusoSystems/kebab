var mongoose = require('mongoose');
var User = mongoose.model('User');
var Subject = mongoose.model('Subject');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

const webhookTriggerName = 'kaschusosystems_notification_grade';

async function processGradeNotifications() {
    console.log('Processing grade notifications...');
    
    const users = await User.find({ gradeNotifications: true });
    console.log(`${users.length} users found for grade notifications`);

    await Promise.all(users.map(async (user) => {
        try {
            const newSubjects = await kaschusoApi.scrapeGrades(user);
            const savedSubjects = await Subject.find({'user': user.id});
            
            const [changedSubjects, changedSubjectsToNotify] = await getChangedSubjects(Object.assign(savedSubjects, {}), newSubjects);

            if (changedSubjects.length !== 0) {
                await Promise.all((await updateSubjects(savedSubjects, changedSubjects, user))
                    .map(subject => subject.save()));
            }

            if (changedSubjectsToNotify.length !== 0) {
                console.log(`new/changed grades in ${changedSubjectsToNotify.length} subject(s) for user ${user.username}`);
                await gmail.sendGradeNotification(user, changedSubjectsToNotify);
                
                if (user.iftttWebhookKey) {
                    webhook.triggerWebhook(user, webhookTriggerName, changedSubjects);
                }
            } else {
                console.log(`no new/changed grades for user ${user.username}`);
            }
        } catch (err) {
            console.error(`error during grade notification processing for user ${user.username}: ${err}`);
        }
    }));
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
    const changedSubjectsToNotify = [];
    newSubjects.map(newSubject => {
        const subject = findBySubject(subjects, newSubject);
        if (subject) {
            const [changedGrades, changedGradesToNotify] = getChangedGrades(subject.grades, newSubject.grades);
            if (changedGrades && changedGrades.length > 0) {
                const changedSubject = Object.assign(newSubject, {});
                changedSubject.grades = changedGradesToNotify;
                changedSubjects.push(changedSubject);
            }
            if (changedGradesToNotify && changedGradesToNotify.length > 0) {
                const changedSubject = Object.assign(newSubject, {});
                changedSubject.grades = changedGradesToNotify;
                changedSubjectsToNotify.push(changedSubject);
            }
        } else {
            changedSubjects.push(newSubject);
            changedSubjectsToNotify.push(newSubject);
        }
    });
    return [changedSubjects, changedSubjectsToNotify];
}

function findByGrade(grades, grade) {
    return grades.find(x => x.name === grade.name && x.date === grade.date);
}

function findBySubject(subjects, subject) {
    return subjects.find(x => x.class === subject.class && x.name === subject.name);
}

function getChangedGrades(grades, newGrades) {
    // anything changed
    const changedGrades = newGrades.filter(x => !grades
        .find(y => x.date      === y.date
                && x.name      === y.name
                && x.value     ==  y.value
                && x.points    ==  y.points
                && x.weighting ==  y.weighting
                && x.average   ==  y.average));
        
    // only the mark changed
    const changedGradesToNotify = changedGrades.filter(x => !grades
        .find(y => x.date === y.date
            && x.name     === y.name
            && x.value    ==  y.value)); // '5.5' shall be equal to 5.5 (string == number)

    return [changedGrades, changedGradesToNotify];
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