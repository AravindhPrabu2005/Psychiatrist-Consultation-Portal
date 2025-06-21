const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

router.post('/api/booking', async (req, res) => {
  try {
    const { userId, adminId, date, time, issue } = req.body;
    if (!userId || !adminId || !date || !time || !issue) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const newBooking = new Booking({ userId, adminId, date, time, issue });
    await newBooking.save();
    res.status(201).json({ message: 'Booking requested successfully', booking: newBooking });
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.get('/bookings/admin/:adminId', async (req, res) => {
  try {
    const bookings = await Booking.find({ adminId: req.params.adminId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

router.post('/bookings/schedule/:bookingId', async (req, res) => {
  try {
    const { meetingLink } = req.body;
    const updated = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      {
        status: 'Approved',
        meetingLink
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Booking not found' });

    res.json({ message: 'Booking approved and scheduled', booking: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve booking' });
  }
});

router.post('/bookings/cancel/:bookingId', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { status: 'Cancelled' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Booking not found' });

    res.json({ message: 'Booking cancelled successfully', booking: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

router.post('/bookings/pay/:bookingId', async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.bookingId,
      { paid: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Booking not found' });

    res.json({ message: 'Payment successful', booking: updated });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

router.get('/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});





module.exports = router;
