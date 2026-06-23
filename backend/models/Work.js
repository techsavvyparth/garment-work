const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  lady: { type: mongoose.Schema.Types.ObjectId, ref: 'Lady', required: true },
  workType: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  rate: { type: Number, required: true, min: 0 },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String },
  images: [{ type: String }], // base64 or URLs
  month: { type: Number }, // 1-12
  year: { type: Number },
  paymentStatus: { type: String, enum: ['pending', 'partial', 'paid'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Auto-compute month/year from date
workSchema.pre('save', function(next) {
  const d = this.date || new Date();
  this.month = d.getMonth() + 1;
  this.year = d.getFullYear();
  this.totalAmount = this.quantity * this.rate;
  next();
});

module.exports = mongoose.model('Work', workSchema);
