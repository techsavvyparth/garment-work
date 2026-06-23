const mongoose = require('mongoose');

const ladySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  address: { type: String, trim: true },
  photo: { type: String }, // base64 or URL
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  notes: { type: String },
  joinDate: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual: total work amount
ladySchema.virtual('totalWorkAmount', {
  ref: 'Work',
  localField: '_id',
  foreignField: 'lady',
  count: false,
});

module.exports = mongoose.model('Lady', ladySchema);
