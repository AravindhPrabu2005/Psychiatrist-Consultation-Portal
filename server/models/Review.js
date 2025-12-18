const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  },
  patientId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  review: { 
    type: String, 
    required: true,
    minlength: 10,
    maxlength: 500
  },
  helpful: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false // Set true if patient had actual appointment
  }
}, { 
  timestamps: true 
});

// Prevent duplicate reviews for same booking
reviewSchema.index({ bookingId: 1 }, { unique: true });

// Index for faster queries
reviewSchema.index({ doctorId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
