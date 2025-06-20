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


module.exports = router;
