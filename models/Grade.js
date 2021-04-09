var mongoose = require('mongoose');
var User = mongoose.model('User');

var SingleGradeSchema = new mongoose.Schema({
  date: String,
  title: String,
  value: Number,
  weighting: Number,
  points: Number
});

SingleGradeSchema.methods.toJSONFor = function() {
  return {
    date: this.date,
    title: this.title,
    value: this.value,
    weighting: this.weighting,
    points: this.points,
  };
};

var GradeSchema = new mongoose.Schema({
  class: { type: String, required: [true, "can't be blank"], index: true },
  name: { type: String, required: [true, "can't be blank"], index: true },
  average: { type: String, required: [true, "can't be blank"], index: true },
  grades: [SingleGradeSchema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

GradeSchema.methods.toJSONFor = function (user) {
  return {
    class: this.class,
    name: this.name,
    average: this.average,
    grades: this.grades.map(x => x.toJSONFor()),
    // user: this.user.toProfileJSONFor(user)
  };
};

mongoose.model('SingleGrade', SingleGradeSchema);
mongoose.model('Grade', GradeSchema);
