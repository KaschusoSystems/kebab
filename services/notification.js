const cron = require('node-cron');

var mongoose = require('mongoose');
var User = mongoose.model('User');
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
            const currentGrades = await kaschusoApi.scrapeGrades(user);
            const savedGrades = await Grade.find({'user': user.id});
            
            const changedGrades = await getChangedGrades(Object.assign(savedGrades, {}), currentGrades);
            const hasChanges = changedGrades.length !== 0;

            if (hasChanges) {
                console.log(`${changedGrades.length} new/changed grades for user ${user.username}`);
                await gmail.sendGradeNotification(user, changedGrades);
                
                // Only update db if changes detected
                await updateGrades(savedGrades, currentGrades, user.id);
                
                if (user.webhookUri) {
                    webhook.triggerWebhook(user.webhookUri, changedGrades);
                }
            }
        }));
    } catch (error) {
        console.log('Error during notifications processing: ' + error);
    }
}

async function updateGrades(savedGrades, currentGrades, userId) {
    await Promise.all(currentGrades.map(async (currentGrade) => {
        const existingGrade = findByGrade(savedGrades, currentGrade);
        if (existingGrade) {
            Object.assign(existingGrade, currentGrade);
            existingGrade.save();
        } else {
            const currentGradeModel = createGradeModelFromGrade(currentGrade, userId);
            await currentGradeModel.save();
        }
    }));
}

function createGradeModelFromGrade(grade, userId) {
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

function findByGrade(array, grade) {
    return array.find(x => x.class === grade.class && x.name === grade.name);
}

function getChangedSingleGrades(savedSingleGrades, currentSingleGrades) {
    return currentSingleGrades.filter(x => savedSingleGrades
        .find(y => y.title !== x.title && y.value !== x.value && y.points !== x.points));
}

// Every minute
cron.schedule('* * * * *', processGradeNotifications);