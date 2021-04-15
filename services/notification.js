const cron = require('node-cron');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Subject = mongoose.model('Subject');
var Grade = mongoose.model('Grade');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

async function processGradeNotifications() {
    console.log('Processing grade notifications...');
    try {
        const users = await User.find({ gradeNotifications: true });
        console.log(`${users.length} users found for grade notifications`);

        await Promise.all(users.map(async (user) => {
            const currentSubjects = await kaschusoApi.scrapeGrades(user);
            const savedSubjects = await Subject.find({'user': user.id});
            
            const changedSubjects = await getChangedSubjects(Object.assign(savedSubjects, {}), currentSubjects);
            const hasChanges = changedSubjects.length !== 0;

            if (hasChanges) {
                console.log(`new/changed grades in ${changedSubjects.length} subject(s) for user ${user.username}`);
                await gmail.sendGradeNotification(user, changedSubjects);
                
                // Only update db if changes detected
                await updateSubjects(savedSubjects, changedSubjects, user.id);
                
                if (user.webhookUri) {
                    webhook.triggerWebhook(user.webhookUri, changedSubjects);
                }
            }
        }));
    } catch (error) {
        console.log('Error during notifications processing: ' + error);
        throw error;
    }
}

async function updateSubjects(savedSubjects, changedSubjects, userId) {
    await Promise.all(changedSubjects.map(async (changedSubject) => {
        const existingSubject = findBySubject(savedSubjects, changedSubject);
        if (existingSubject) {
            mergeSubjectObjects(existingSubject, changedSubject);
            await existingSubject.save();
        } else {
            const currentSubjectModel = createSubjectModel(changedSubject, userId);
            await currentSubjectModel.save();
        }
    }));
}

function mergeSubjectObjects(existingSubject, changedSubject) {
    existingSubject.average = changedSubject.average;
    changedSubject.grades.forEach(x => {
        const existingGrade = findByGrade(existingSubject.grades, x);
        if (existingGrade) {
            Object.assign(existingGrade, x);
        } else {
            appendGradeToSubject(existingSubject, x);
        }
    });
}
// add to mongoose model
function appendGradeToSubject(subject, grade) {
    const gradeModel = new Grade();
    Object.assign(gradeModel, grade);
    subject.grades.unshift(grade);
}

function createSubjectModel(subject, userId) {
    const subjectModel = new Subject();
    Object.assign(subjectModel, subject);
    subjectModel.user = userId;
    return subjectModel;
}

async function getChangedSubjects(savedSubjects, currentSubjects) {
    const changedSubjects = [];
    await Promise.all(currentSubjects.map(async (currentSubject) => {
        const matchingSavedSubject = findByGrade(savedSubjects, currentSubject);
        if (matchingSavedSubject) {
            const changedGrades = getChangedGrades(matchingSavedSubject.grades, currentSubject.grades);
            if (changedGrades && changedGrades.length > 0) {
                const changedSubject = Object.assign(currentSubject, {});
                changedSubject.grades = changedGrades;
                changedSubjects.push(changedSubject);
            }
        } else {
            changedSubjects.push(currentSubject);
        }
    }));
    return changedSubjects;
}

function findByGrade(array, grade) {
    return array.find(x => x.title === grade.title && x.date === grade.date);
}

function findBySubject(array, subject) {
    return array.find(x => x.class === subject.class && x.name === subject.name);
}

function getChangedGrades(savedGrades, currentGrades) {
    return currentGrades.filter(x => savedGrades
        .find(y => y.title !== x.title && y.value !== x.value && y.points !== x.points));
}
processGradeNotifications()
// Every minute
cron.schedule('* * * * *', processGradeNotifications);