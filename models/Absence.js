var mongoose = require('mongoose');

var AbsenceSchema = new mongoose.Schema({
  date: String,
  time: String,
  class: String,
  status: { type: String, enum : ['Unentschuldigt','Entschuldigt', 'Nicht zählend', 'offen'], default: 'offen', index: true },
  comment: String,
  reason: String,
  lastNotification: { type: Number, default: new Date().getTime() },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

AbsenceSchema.methods.notifiedNow = function() {
  this.lastNotification = new Date().getTime();
  return this;
};

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
