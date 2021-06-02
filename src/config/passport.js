var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

const logger = require('../domain/logger');
const kaschusoApi = require('../services/kaschuso-api');
const gmail = require('../services/gmail');

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async function (req, username, password, done) {
  logger.info(`passport.localStrategy.invoked`);
  const mandator = req.body.mandator;
  
  User.findOne({
    username: username,
    mandator: mandator
  }).then(async function (user) {
    if (user) {
      if (password === user.getDecryptedPassword()) {
        const isUserLoginValid = await kaschusoApi.login(user.username, user.getDecryptedPassword(), user.mandator);
        
        if (!isUserLoginValid) {
          logger.debug(`passport.localStrategy.kaschusoNotAuthenticated.user-${username}.mandator-${mandator}`);
          user.kaschusoAuthenticated = false;
        } else {
          logger.debug(`passport.localStrategy.authenticated.user-${username}.mandator-${mandator}`);
          user.kaschusoAuthenticated = true;
        }
      } else {
        logger.error(`passport.localStrategy.user-${username}.mandator-${mandator}`);
        return done(null, false, {
          errors: {
            'Error': 'on login'
          }
        });
      }
    } else {
      const isPassedLoginValid = await kaschusoApi.login(username, password, mandator);
      
      if (!isPassedLoginValid) {
        logger.debug(`passport.localStrategy.kaschusoLoginInvalid.user-${username}.mandator-${mandator}`);
        return done(null, false, {
          errors: {
            'Kaschuso login': 'is invalid'
          }
        });
      } else {
        logger.debug(`passport.localStrategy.newUser.user-${username}.mandator-${mandator}`);
        user = await createNewUser(username, password, mandator);
      }
    }
    
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