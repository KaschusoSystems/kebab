var mongoose = require('mongoose');

var AbsenceSchema = new mongoose.Schema({
  date: String,
  time: String,
  class: String,
  status: { type: String, enum : ['Unentschuldigt','Entschuldigt', 'Nicht zählend', 'offen'], default: 'Unentschuldigt', index: true },
  comment: String,
  reason: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

AbsenceSchema.methods.toJSONFor = function() {
  return {
    date: this.date,
    time: this.time,
    class: this.class,
    status: this.status,
    comment: this.comment,
    reason: this.reason,
  };
};

mongoose.model('Absence', AbsenceSchema);
