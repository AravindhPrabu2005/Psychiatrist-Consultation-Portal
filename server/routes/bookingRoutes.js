const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// Create new booking with payment and collision prevention
router.post('/api/booking', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId, adminId, date, time, issue, paymentStatus, amount } = req.body;
    
    if (!userId || !adminId || !date || !time || !issue) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if this slot is already booked (within transaction)
    const existingBooking = await Booking.findOne({
      adminId,
      date,
      time,
      $or: [
        { status: 'Approved', paid: true },
        { status: 'pending', paid: true }
      ]
    }).session(session);

    if (existingBooking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(409).json({ 
        error: 'This time slot is already booked. Please select another time.',
        conflict: true
      });
    }

    // Create booking with lock
    const newBooking = new Booking({ 
      userId, 
      adminId, 
      date, 
      time, 
      issue,
      paymentStatus: paymentStatus || 'pending',
      amount: amount || 500,
      paymentId: `pay_${uuidv4()}`,
      transactionDate: paymentStatus === 'paid' ? new Date() : null,
      paid: paymentStatus === 'paid',
      status: paymentStatus === 'paid' ? 'Approved' : 'pending'
    });

    await newBooking.save({ session });
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    res.status(201).json({ 
      message: 'Booking confirmed successfully', 
      booking: newBooking 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Doctor adds/updates meeting link for a booking
router.patch('/bookings/:bookingId/meeting-link', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { meetingLink } = req.body;
    
    if (!meetingLink) {
      return res.status(400).json({ error: 'Meeting link is required' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { meetingLink },
      { new: true }
    ).populate('userId', 'name email phone');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ 
      message: 'Meeting link added successfully', 
      booking 
    });
  } catch (error) {
    console.error('Error updating meeting link:', error);
    res.status(500).json({ error: 'Failed to add meeting link' });
  }
});

// Get all bookings for admin/doctor
router.get('/bookings/admin/:adminId', async (req, res) => {
  try {
    const bookings = await Booking.find({ adminId: req.params.adminId })
      .populate('userId', 'name email phone profilePhoto')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get all bookings for user/patient
router.get('/bookings/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('adminId', 'name specialization profilePhoto')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get single booking by ID (for viewing meeting link)
router.get('/bookings/:bookingId', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate('userId', 'name email phone profilePhoto')
      .populate('adminId', 'name specialization profilePhoto');
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Update booking status (approve/reject/cancel)
router.patch('/bookings/:bookingId/status', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'Approved', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ 
      message: 'Booking status updated successfully', 
      booking 
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Check slot availability before booking (optional - for real-time checking)
router.post('/bookings/check-availability', async (req, res) => {
  try {
    const { adminId, date, time } = req.body;

    if (!adminId || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingBooking = await Booking.findOne({
      adminId,
      date,
      time,
      $or: [
        { status: 'Approved', paid: true },
        { status: 'pending', paid: true }
      ]
    });

    res.json({ 
      available: !existingBooking,
      message: existingBooking ? 'Slot already booked' : 'Slot available'
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
});

module.exports = router;
