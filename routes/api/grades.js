var mongoose = require('mongoose');
var router = require('express').Router();
var Grade = mongoose.model('Grade');
var auth = require('../auth');

router.get('/', auth.required, async function (req, res, next) {
  const userId = req.payload.id;
  const grades = await Grade.find({'user': userId});
  return res.json(grades.map(x => x.toJSONFor()));
});

module.exports = router;