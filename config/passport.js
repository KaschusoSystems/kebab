var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

const kaschusoApi = require('../services/kaschuso-api');
const gmail = require('../services/gmail');

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async function (req, username, password, done) {
  const mandator = req.body.mandator;

  const isLoginValid = await kaschusoApi.login(username, password, mandator);
  if (!isLoginValid) {
    return done(null, false, {
      errors: {
        'Kaschuso login': 'is invalid'
      }
    });
  }

  User.findOne({
    username: username,
    mandator: mandator
  }).then(async function (user) {
    if (!user) {
      user = await createNewUser(username, password, mandator);
    }

    user.setCredential(password);

    return done(null, await user.save());
  }).catch(done);
}));

async function createNewUser(username, password, mandator) {
  const user = new User();
  user.username = username;
  user.mandator = mandator;
  user.setCredential(password);

  const userInfo = await kaschusoApi.getUserInfo(user);
  user.name = userInfo.name;
  user.email = userInfo.privateEmail;
  user.gradeNotifications = true;
  user.absenceNotifications = true;
  user.absenceReminders = true;
  user.monthlySummary = true;

  // initial scrape so the user does not recieve an initial email => do non blocking
  kaschusoApi.scrapeGrades(user).then(subjects => {
    Promise.all(subjects.map(async subject => await user.addSubject(subject).save()));
  });
  kaschusoApi.scrapeAbsences(user).then(absences => {
    Promise.all(absences.map(async absence => await user.addAbsence(absence).save()));
  });

  // send welcome mail => visual feedback that the service works
  gmail.sendWelcomeMail(user);

  return await user.save();
}