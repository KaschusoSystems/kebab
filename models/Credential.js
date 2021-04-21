var mongoose = require('mongoose');

var CredentialSchema = new mongoose.Schema({
  iv: String,
  hash: String
});

mongoose.model('Credential', CredentialSchema);