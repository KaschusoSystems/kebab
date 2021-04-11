const cron = require('node-cron');

var mongoose = require('mongoose');
var User = mongoose.model('User');
var Grade = mongoose.model('Grade');
var SingleGrade = mongoose.model('SingleGrade');

const kaschusoApi = require('./kaschuso-api');
const webhook = require('./webhook');
const gmail = require('./gmail');

async function processGradeNotifications() {
    console.log('Processing grade notifications...');
    try {
        const users = await User.find({ gradeNotifications: true });
        console.log(`${users.length} users found for grade notifications`);

        await Promise.all(users.map(async (user) => {
            const currentGrades = await kaschusoApi.scrapeGrades(user);
            const savedGrades = await Grade.find({'user': user.id});
            
            const changedGrades = await getChangedGrades(Object.assign(savedGrades, {}), currentGrades);
            const hasChanges = changedGrades.length !== 0;

            if (hasChanges) {
                console.log(`${changedGrades.length} new/changed grades for user ${user.username}`);
                await gmail.sendGradeNotification(user, changedGrades);
                
                // Only update db if changes detected
                await updateGrades(savedGrades, changedGrades, user.id);
                
                if (user.webhookUri) {
                    webhook.triggerWebhook(user.webhookUri, changedGrades);
                }
            }
        }));
    } catch (error) {
        console.log('Error during notifications processing: ' + error);
    }
}

async function updateGrades(savedGrades, changedGrades, userId) {
    await Promise.all(changedGrades.map(async (changedGrade) => {
        const existingGrade = findByGrade(savedGrades, changedGrade);
        if (existingGrade) {
            mergeGradeObjects(existingGrade, changedGrade);
            await existingGrade.save();
        } else {
            const currentGradeModel = createGradeModel(changedGrade, userId);
            await currentGradeModel.save();
        }
    }));
}

function mergeGradeObjects(existingGrade, changedGrade) {
    existingGrade.average = changedGrade.average;
    changedGrade.grades.forEach(x => {
        const existingSingleGrade = findBySingleGrade(existingGrade.grades, x);
        if (existingSingleGrade) {
            Object.assign(existingSingleGrade, x);
        } else {
            appendSingleGradeToGrade(existingGrade, x);
        }
    });
}

function appendSingleGradeToGrade(grade, singleGrade) {
    const singleGradeModel = new SingleGrade();
    Object.assign(singleGradeModel, singleGrade);
    grade.grades.unshift(singleGrade);
}

function createGradeModel(grade, userId) {
    const gradeModel = new Grade();
    Object.assign(gradeModel, grade);
    gradeModel.user = userId;
    return gradeModel;
}

async function getChangedGrades(savedGrades, currentGrades) {
    const changedGrades = [];
    await Promise.all(currentGrades.map(async (currentGrade) => {
        const matchingSavedGrade = findByGrade(savedGrades, currentGrade);
        if (matchingSavedGrade) {
            const changedSingleGrades = getChangedSingleGrades(matchingSavedGrade.grades, currentGrade.grades);
            if (changedSingleGrades && changedSingleGrades.length > 0) {
                const changedGrade = Object.assign(currentGrade, {});
                changedGrade.grades = changedSingleGrades;
                changedGrades.push(changedGrade);
            }
        } else {
            changedGrades.push(currentGrade);
        }
    }));
    return changedGrades;
}

function findBySingleGrade(array, singleGrade) {
    return array.find(x => x.title === singleGrade.title && x.date === singleGrade.date);
}

function findByGrade(array, grade) {
    return array.find(x => x.class === grade.class && x.name === grade.name);
}

function getChangedSingleGrades(savedSingleGrades, currentSingleGrades) {
    return currentSingleGrades.filter(x => savedSingleGrades
        .find(y => y.title !== x.title && y.value !== x.value && y.points !== x.points));
}

// Every minute
cron.schedule('* * * * *', processGradeNotifications);