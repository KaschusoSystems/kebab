var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Credential = mongoose.model('Credential');

const crypter = require('../services/crypter');

const kaschusoApi = require('../services/kaschuso-api');

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
    } else {
      await syncUserPassword(user, password);
    }

    return done(null, user);
  }).catch(done);
}));

async function createNewUser(username, password, mandator) {
  const user = new User();
  user.username = username;
  user.credential = createUserCredential(password);
  user.mandator = mandator;

  const userInfo = await kaschusoApi.getUserInfo(user);
  user.email = userInfo.privateEmail;
  user.gradeNotifications = true;
  user.absenceReminders = true;
  user.monthlySummary = true;
  await user.save();
  return user;
}

async function syncUserPassword(user, password) {
  user.credential = createUserCredential(password);
  await user.save();
}

function createUserCredential(password) {
  const credentialModel = new Credential();
  Object.assign(credentialModel, crypter.encrypt(password));
  return credentialModel;
}