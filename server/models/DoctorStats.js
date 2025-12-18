const mongoose = require('mongoose');

const doctorStatsSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true,
    unique: true 
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    get: v => Math.round(v * 10) / 10 // Round to 1 decimal
  },
  ratingDistribution: {
    1: { type: Number, default: 0 },
    2: { type: Number, default: 0 },
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  }
}, { 
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model('DoctorStats', doctorStatsSchema);
