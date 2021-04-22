require('./Subject');
require('./Credential');

var mongoose = require('mongoose');
var Subject = mongoose.model('Subject');
var Credential = mongoose.model('Credential');

var uniqueValidator = require('mongoose-unique-validator');
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;
const crypter = require('../services/crypter');

var UserSchema = new mongoose.Schema({
  username: { type: String, required: [true, "can't be blank"], index: true },
  credential: { type: Credential.schema, required: [true, "can't be blank"], index: true },
  mandator: { type: String, required: [true, "can't be blank"], index: true },
  email: String,
  gradeNotifications: Boolean,
  absenceReminders: Boolean,
  monthlySummary: Boolean,
  webhookUri: String
}, { timestamps: true });

UserSchema.plugin(uniqueValidator, { message: 'is already taken.' });

UserSchema.methods.addSubject = function (subject) {
  const subjectModel = new Subject(subject);
  subjectModel.user = this;
  return subjectModel;
}

UserSchema.methods.generateJWT = function () {
  var today = new Date();
  var exp = new Date(today);

  // 2 months lol
  exp.setDate(today.getDate() + 60);

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

UserSchema.methods.getDecryptedPassword = function () {
  return crypter.decrypt(this.credential.password, this.credential.iv);
};

UserSchema.methods.setCredential = function (password) {
  const crypterResult = crypter.encrypt(password);
  const credentialModel = new Credential();
  credentialModel.iv = crypterResult.iv;
  credentialModel.password = crypterResult.encrypted;

  this.credential = credentialModel;
};

mongoose.model('User', UserSchema);
