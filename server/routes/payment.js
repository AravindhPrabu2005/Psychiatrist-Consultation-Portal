const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
require('dotenv').config();

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create Checkout Session
router.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { bookingId, amount, userId, adminId, date, time } = req.body;

    if (!bookingId || !amount || amount < 1) {
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

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: 'PsyCare Therapy Session',
              description: `Consultation with Dr. ${booking.adminId.name} on ${date} at ${time}`,
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
        bookingId: bookingId.toString(),
        userId: userId.toString(),
        adminId: adminId.toString(),
        sessionDate: `${date} ${time}`,
        patientName: booking.userId.name,
        doctorName: booking.adminId.name,
      },
    });

    booking.paymentIntentId = session.id;
    booking.paymentStatus = 'pending';
    await booking.save();

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Checkout session creation failed:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ NEW: Verify payment directly from Stripe and update booking
router.post('/api/verify-payment', async (req, res) => {
  try {
    const { sessionId, bookingId } = req.body;

    if (!sessionId || !bookingId) {
      return res.status(400).json({ error: 'Missing sessionId or bookingId' });
    }

    // ✅ Ask Stripe directly if payment was successful
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      // ✅ Update booking in DB
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paid: true,
          paymentStatus: 'paid',
          status: 'Approved',
          paymentIntentId: session.id,
          transactionDate: new Date(),
          amount: session.amount_total / 100,
        },
        { new: true }
      );

      if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
      }

      return res.json({
        success: true,
        paid: true,
        booking,
      });
    } else {
      // Payment not completed yet
      return res.json({
        success: false,
        paid: false,
        paymentStatus: session.payment_status,
      });
    }

  } catch (error) {
    console.error('Payment verification failed:', error);
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
