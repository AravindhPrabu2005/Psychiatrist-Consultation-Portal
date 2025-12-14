const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking.js');
const User = require('../models/User.js');
const Admin = require('../models/Admin.js');
const Message = require('../models/Message.js');

// Get conversation history between two users
router.get("/messages/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const { userType, otherUserType } = req.query; // 'User' or 'Admin'

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .limit(100); // Limit for performance

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching messages", error: error.message });
  }
});

// Mark messages as read
router.patch("/messages/read/:receiverId/:senderId", async (req, res) => {
  try {
    const { receiverId, senderId } = req.params;

    await Message.updateMany(
      { senderId: senderId, receiverId: receiverId, isRead: false },
      { isRead: true }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating messages", error: error.message });
  }
});

// Get unread message count
router.get("/messages/unread/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const unreadCount = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching unread count", error: error.message });
  }
});

// Get all patients who have bookings with a specific admin/doctor
router.get("/getPatients/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find all bookings for this admin
    const bookings = await Booking.find({ adminId: adminId }).select('userId');

    // Extract unique user IDs
    const userIds = [...new Set(bookings.map(booking => booking.userId.toString()))];

    // Fetch only name and profilePhoto for unique users
    const users = await User.find({ _id: { $in: userIds } })
      .select('name profilePhoto');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching patients", error: error.message });
  }
});

// Get all doctors/admins who the patient has booked with
router.get("/getDoctors/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all bookings for this user/patient
    const bookings = await Booking.find({ userId: userId }).select('adminId');

    // Extract unique admin IDs
    const adminIds = [...new Set(bookings.map(booking => booking.adminId.toString()))];

    // Fetch only name and profilePhoto for unique admins
    const doctors = await Admin.find({ _id: { $in: adminIds } })
      .select('name profilePhoto');

    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching doctors", error: error.message });
  }
});

module.exports = router;
