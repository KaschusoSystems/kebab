var mongoose = require('mongoose');
var router = require('express').Router();
var passport = require('passport');
var User = mongoose.model('User');
var auth = require('../auth');

router.put('/user', auth.required, function (req, res, next) {
  User.findById(req.payload.id).then(function (user) {
    if (!user) {
      return res.sendStatus(401);
    }

    // only update fields that were actually passed...
    if (typeof req.body.email !== 'undefined') {
      user.email = req.body.email;
    }
    if (typeof req.body.gradeNotifications !== 'undefined') {
      user.gradeNotifications = req.body.gradeNotifications;
    }
    if (typeof req.body.absenceNotifications !== 'undefined') {
      user.absenceNotifications = req.body.absenceNotifications;
    }
    if (typeof req.body.absenceReminders !== 'undefined') {
      user.absenceReminders = req.body.absenceReminders;
    }
    if (typeof req.body.monthlySummary !== 'undefined') {
      user.monthlySummary = req.body.monthlySummary;
    }
    if (typeof req.body.webhookUri !== 'undefined') {
      user.webhookUri = req.body.webhookUri;
    }

    return user.save().then(function () {
      return res.json({ user: user.toProfileJSONFor() });
    });
  }).catch(next);
});

router.post('/users/login', function (req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const mandator = req.body.mandator;
  if (!username) {
    return res.status(422).json({ errors: { username: "can't be blank" } });
  }
  if (!password) {
    return res.status(422).json({ errors: { password: "can't be blank" } });
  }
  if (!mandator) {
    return res.status(422).json({ errors: { mandator: "can't be blank" } });
  }

  passport.authenticate('local', { session: false }, function (err, user, info) {
    if (err) {
      return next(err);
    }
    if (user) {
      user.token = user.generateJWT();
      return res.json({ user: user.toAuthJSON() });
    } else {
      return res.status(422).json(info);
    }
  })(req, res, next);
});

module.exports = router;
