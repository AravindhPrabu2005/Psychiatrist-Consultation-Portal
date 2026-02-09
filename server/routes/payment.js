const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
router.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { bookingId, amount, userId, adminId, date, time } = req.body;
    
    if (!bookingId || !amount || amount < 50) {
      return res.status(400).json({ error: 'Invalid booking or amount' });
    }

    const booking = await Booking.findById(bookingId)
      .populate('userId', 'name email')
      .populate('adminId', 'name');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.paid || booking.paymentStatus === 'paid') {
      return res.status(400).json({ error: 'Booking already paid' });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'PsyCare Therapy Session',
              description: `Consultation with ${booking.adminId.name} on ${date} at ${time}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/booking-success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId}`,
      cancel_url: `${process.env.FRONTEND_URL}/booking-cancelled?booking_id=${bookingId}`,
      client_reference_id: bookingId,
      customer_email: booking.userId.email,
      metadata: {
        bookingId: bookingId,
        userId: userId,
        adminId: adminId,
        sessionDate: `${date} ${time}`,
        patientName: booking.userId.name,
        doctorName: booking.adminId.name,
      },
    });

    // Save session ID to booking
    booking.paymentIntentId = session.id;
    booking.stripeClientSecret = session.payment_intent;
    booking.paymentStatus = 'pending';
    await booking.save();
    
    res.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Checkout session creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check payment status
router.get('/api/payment-status/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      paymentStatus: booking.paymentStatus,
      paid: booking.paid,
      status: booking.status,
      paymentIntentId: booking.paymentIntentId,
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({ error: 'Failed to check payment status' });
  }
});

module.exports = router;
