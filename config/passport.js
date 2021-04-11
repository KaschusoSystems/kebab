var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('User');

const kaschusoApi = require('../services/kaschuso-api');

passport.use(new LocalStrategy({
  usernameField: 'username',
  passwordField: 'password',
  passReqToCallback: true
}, async function (req, username, password, done) {
  const mandator = req.body.mandator;
  console.log(`passport validation params: ${JSON.stringify({ username, password, mandator })}`);

  const isLoginValid = await kaschusoApi.login(username, password, mandator);
  if (!isLoginValid) {
    return done(null, false, { errors: { 'Kaschuso login': 'is invalid' } });
  }

  User.findOne({ username: username, mandator: mandator }).then(async function (user) {
    if (!user) {
      var user = new User();
      user.username = username;
      user.password = password;
      user.mandator = mandator;

      const userInfo = await kaschusoApi.getUserInfo(user);
      user.email = userInfo.privateEmail;
      user.gradeNotifications = true;
      user.absenceReminders = true;
      user.monthlySummary = true;

      await user.save();
    }

    if (user.password !== password) {
      user.password = password;
      await user.save();
    }

    return done(null, user);
  }).catch(done);
}));

