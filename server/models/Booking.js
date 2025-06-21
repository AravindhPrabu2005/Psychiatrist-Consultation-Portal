const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  issue: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  meetingLink: { type: String, default: '' },
  paid: { type: Boolean, default: false } // ✅ New field
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
