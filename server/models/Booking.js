const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  issue: { type: String, required: true },
  meetingLink: { type: String, default: '' },
  
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending' 
  },
  amount: { type: Number, required: true },
  paymentId: { type: String },
  transactionDate: { type: Date },
  paid: { type: Boolean, default: false },
  
  //Stripe-specific fields 
  paymentIntentId: { type: String, unique: true, sparse: true },
  stripeClientSecret: { type: String },
  lastPaymentError: { type: String },
  
  status: {
    type: String,
    enum: ['pending', 'Approved', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

// KEEPING YOUR EXISTING INDEX - No changes!
bookingSchema.index(
  { adminId: 1, date: 1, time: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      paid: true,
      status: { $in: ['Approved', 'pending'] }
    }
  }
);

module.exports = mongoose.model('Booking', bookingSchema);
