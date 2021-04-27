var mongoose = require('mongoose');
var router = require('express').Router();
var Grade = mongoose.model('Grade');
var User = mongoose.model('User');
var Subject = mongoose.model('Subject');
var auth = require('../auth');

router.get('/', auth.required, async function (req, res, next) {
  const userId = req.payload.id;
  const subjects = await Subject.find({'user': userId});
  return res.json(subjects.map(x => x.toJSONFor()));
});

module.exports = router;