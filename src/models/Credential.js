var mongoose = require('mongoose');

var CredentialSchema = new mongoose.Schema({
  iv: String,
  password: String
});

mongoose.model('Credential', CredentialSchema);