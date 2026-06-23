const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  lady: { type: mongoose.Schema.Types.ObjectId, ref: 'Lady', required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['cash', 'upi', 'bank', 'other'], default: 'cash' },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  month: { type: Number },
  year: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

paymentSchema.pre('save', function(next) {
  const d = this.date || new Date();
  this.month = d.getMonth() + 1;
  this.year = d.getFullYear();
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
