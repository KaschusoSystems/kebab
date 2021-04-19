require('./Subject');

var mongoose = require('mongoose');
var Subject = mongoose.model('Subject');
var uniqueValidator = require('mongoose-unique-validator');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

var UserSchema = new mongoose.Schema({
  username: { type: String, required: [true, "can't be blank"], index: true },
  password: { type: String, required: [true, "can't be blank"], index: true },
  mandator: { type: String, required: [true, "can't be blank"], index: true },
  email: String,
  gradeNotifications: Boolean,
  absenceReminders: Boolean,
  monthlySummary: Boolean,
  webhookUri: String
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.addSubject = async function (subject) {
    const subjectModel = new Subject(subject);
    subjectModel.user = this;
    return await subjectModel.save();
}

UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);

  // 2 months lol
  exp.setDate(today.getDate() + 60);

  // TODO needed claims?
  return jwt.sign({
    id: this._id,
    username: this.username,
    mandator: this.mandator,
    exp: parseInt(exp.getTime() / 1000),
  }, secret);
};

UserSchema.methods.toAuthJSON = function () {
  return {
    token: this.generateJWT(),
    user: this.toProfileJSONFor()
  };
};

UserSchema.methods.toProfileJSONFor = function () {
  return {
    username: this.username,
    mandator: this.mandator,
    email: this.email,
    gradeNotifications: this.gradeNotifications,
    absenceReminders: this.absenceReminders,
    monthlySummary: this.monthlySummary,
    webhookUri: this.webhookUri
  };
};

mongoose.model('User', UserSchema);
