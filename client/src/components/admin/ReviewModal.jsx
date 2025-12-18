import React, { useState } from 'react';
import { Star, X, Send } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

const ReviewModal = ({ isOpen, onClose, booking, doctorName, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (review.trim().length < 10) {
      alert('Please write at least 10 characters');
      return;
    }

    setSubmitting(true);

    try {
      await axiosInstance.post('/api/reviews', {
        doctorId: booking.adminId,
        patientId: localStorage.getItem('id'),
        bookingId: booking._id,
        rating,
        review: review.trim()
      });

      alert('✅ Review submitted successfully!');
      setRating(0);
      setReview('');
      onReviewSubmitted();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 409) {
        alert('You have already reviewed this appointment');
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition"
            disabled={submitting}
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Star className="text-yellow-500 fill-yellow-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Write a Review</h3>
              <p className="text-sm text-white/80">Dr. {doctorName}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Rating Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              How would you rate your experience?
            </label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                  type="button"
                >
                  <Star
                    size={40}
                    className={
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {rating === 0 && 'Select a rating'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Share your experience
            </label>
            <textarea
              rows="5"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              maxLength={500}
              placeholder="Tell us about your consultation with the doctor..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-gray-500">Minimum 10 characters</p>
              <p className="text-xs text-gray-500">{review.length}/500</p>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={submitting || rating === 0 || review.trim().length < 10}
            className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
              submitting || rating === 0 || review.trim().length < 10
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg'
            }`}
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ReviewModal;
