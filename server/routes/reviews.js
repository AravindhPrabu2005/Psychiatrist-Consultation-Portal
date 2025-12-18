const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const DoctorStats = require('../models/DoctorStats');
const Booking = require('../models/Booking');
const User = require('../models/User');

// Get all reviews for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get doctor stats
router.get('/stats/:doctorId', async (req, res) => {
  try {
    let stats = await DoctorStats.findOne({ doctorId: req.params.doctorId });
    
    if (!stats) {
      // Create default stats if none exist
      stats = new DoctorStats({ doctorId: req.params.doctorId });
      await stats.save();
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Check if user can review (must have completed appointment)
router.get('/can-review/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.query.userId;

    // Check if booking exists and is completed
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.json({ canReview: false, reason: 'Booking not found' });
    }

    if (booking.userId.toString() !== userId) {
      return res.json({ canReview: false, reason: 'Not your booking' });
    }

    // Check if appointment date has passed
    const appointmentDate = new Date(booking.date);
    const now = new Date();
    
    if (appointmentDate > now) {
      return res.json({ canReview: false, reason: 'Appointment not yet completed' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ bookingId });
    
    if (existingReview) {
      return res.json({ canReview: false, reason: 'Already reviewed' });
    }

    res.json({ canReview: true, booking });
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ error: 'Failed to check eligibility' });
  }
});

// Submit a review
router.post('/', async (req, res) => {
  try {
    const { doctorId, patientId, bookingId, rating, review } = req.body;

    // Validate
    if (!doctorId || !patientId || !bookingId || !rating || !review) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if booking exists and belongs to user
    const booking = await Booking.findById(bookingId);
    
    if (!booking || booking.userId.toString() !== patientId) {
      return res.status(403).json({ error: 'Invalid booking' });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ bookingId });
    
    if (existingReview) {
      return res.status(409).json({ error: 'You have already reviewed this appointment' });
    }

    // Create review
    const newReview = new Review({
      doctorId,
      patientId,
      bookingId,
      rating,
      review,
      verified: true // Since we verified the booking
    });

    await newReview.save();

    // Update doctor stats
    await updateDoctorStats(doctorId);

    const populatedReview = await Review.findById(newReview._id)
      .populate('patientId', 'name profilePhoto');

    res.status(201).json({ 
      message: 'Review submitted successfully', 
      review: populatedReview 
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Mark review as helpful
router.patch('/:reviewId/helpful', async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ helpful: review.helpful });
  } catch (error) {
    console.error('Error updating helpful count:', error);
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Helper function to update doctor stats
async function updateDoctorStats(doctorId) {
  const reviews = await Review.find({ doctorId });
  
  const totalReviews = reviews.length;
  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
    totalRating += review.rating;
  });

  const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

  await DoctorStats.findOneAndUpdate(
    { doctorId },
    {
      totalReviews,
      averageRating,
      ratingDistribution
    },
    { upsert: true, new: true }
  );
}

module.exports = router;
