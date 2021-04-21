require('./Grade');

var mongoose = require('mongoose');
var Grade = mongoose.model('Grade');

var SubjectSchema = new mongoose.Schema({
  class: { type: String, required: [true, "can't be blank"], index: true },
  name: { type: String, required: [true, "can't be blank"], index: true },
  average: { type: String, required: [true, "can't be blank"], index: true },
  grades: [Grade.schema],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

SubjectSchema.methods.addGrade = async function (grade) {
    this.grades.unshift(grade);
    return this;
}

SubjectSchema.methods.toJSONFor = function () {
  return {
    class: this.class,
    name: this.name,
    average: this.average,
    grades: this.grades.map(x => x.toJSONFor()),
  };
};

mongoose.model('Subject', SubjectSchema);
