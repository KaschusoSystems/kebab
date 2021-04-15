var mongoose = require('mongoose');

var GradeSchema = new mongoose.Schema({
  date: String,
  title: String,
  value: Number,
  weighting: Number,
  points: Number
}, { timestamps: true });

GradeSchema.methods.toJSONFor = function() {
  return {
    date: this.date,
    title: this.title,
    value: this.value,
    weighting: this.weighting,
    points: this.points,
  };
};

mongoose.model('Grade', GradeSchema);
