import React, { useEffect, useState, useCallback } from 'react';
import UserNavbar from './UserNavbar';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Clock, History, Calendar, CheckCircle,
  AlertCircle, X, User, Star, Send,
  ArrowLeft, Search, Filter
} from 'lucide-react';
import Footer from '../Footer';

const UserAppointmentHistory = () => {
  const userId = localStorage.getItem('id');
  const navigate = useNavigate();

  const [pastBookings, setPastBookings] = useState([]);
  const [adminDetails, setAdminDetails] = useState({});
  const [reviews, setReviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all'); // all | reviewed | unreviewed

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bookingsRes = await axiosInstance.get(`/bookings/user/${userId}`);
      const approved = bookingsRes.data.filter(b => b.status === 'Approved');

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const past = approved.filter(b => {
        const d = new Date(b.date);
        d.setHours(0, 0, 0, 0);
        return d < now;
      });

      const uniqueAdminIds = [...new Set(
        past.map(b => typeof b.adminId === 'object' ? b.adminId._id : b.adminId)
      )];

      const adminResults = await Promise.all(
        uniqueAdminIds.map(adminId =>
          axiosInstance.get(`/admins/${adminId}`)
            .then(res => ({ id: adminId, data: res.data }))
            .catch(() => ({ id: adminId, data: null }))
        )
      );

      const adminData = {};
      adminResults.forEach(({ id, data }) => { adminData[id] = data; });

      const reviewResults = await Promise.all(
        past.map(async (b) => {
          try {
            const canReviewRes = await axiosInstance.get(`/api/reviews/can-review/${b._id}?userId=${userId}`);
            if (canReviewRes.data.canReview === false && canReviewRes.data.reason === 'Already reviewed') {
              const adminIdStr = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
              const reviewsRes = await axiosInstance.get(`/api/reviews/doctor/${adminIdStr}`);
              const userReview = reviewsRes.data.find(r => r.bookingId === b._id);
              return { bookingId: b._id, review: userReview };
            }
            return { bookingId: b._id, review: null };
          } catch {
            return { bookingId: b._id, review: null };
          }
        })
      );

      const reviewsMap = {};
      reviewResults.forEach(({ bookingId, review }) => { if (review) reviewsMap[bookingId] = review; });

      setAdminDetails(adminData);
      setPastBookings(past.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setReviews(reviewsMap);
    } catch {
      setError('Failed to load history. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <Star key={i} size={13} className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
  ));

  const openReviewModal = (booking, admin) => {
    const adminIdStr = typeof booking.adminId === 'object' ? booking.adminId._id : booking.adminId;
    setSelectedBookingForReview({ ...booking, doctorName: admin.name, adminId: adminIdStr });
    setReviewModalOpen(true);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedBookingForReview(null);
    setRating(0);
    setReviewText('');
  };

  const handleSubmitReview = async () => {
    if (rating === 0) { alert('Please select a rating'); return; }
    if (reviewText.trim().length < 10) { alert('Please write at least 10 characters'); return; }
    setSubmittingReview(true);
    try {
      await axiosInstance.post('/api/reviews', {
        doctorId: selectedBookingForReview.adminId,
        patientId: userId,
        bookingId: selectedBookingForReview._id,
        rating,
        review: reviewText.trim()
      });
      alert('✅ Review submitted successfully!');
      closeReviewModal();
      fetchHistory();
    } catch (error) {
      if (error.response?.status === 409) alert('You have already reviewed this appointment');
      else alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filter + Search
  const filteredBookings = pastBookings.filter(b => {
    const adminIdStr = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
    const admin = adminDetails[adminIdStr];
    const doctorName = admin?.name?.toLowerCase() || '';
    const issue = b.issue?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();

    const matchesSearch = !query || doctorName.includes(query) || issue.includes(query);
    const hasReview = !!reviews[b._id];
    const matchesFilter =
      filterRating === 'all' ||
      (filterRating === 'reviewed' && hasReview) ||
      (filterRating === 'unreviewed' && !hasReview);

    return matchesSearch && matchesFilter;
  });

  if (error) return (
    <>
      <UserNavbar />
      <div className="pt-24 px-4 max-w-5xl mx-auto pb-10">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchHistory} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition">
            Try Again
          </button>
        </div>
      </div>
      <Footer />
    </>
  );

  return (
    <>
      <UserNavbar />
      <div className="pt-24 px-4 max-w-5xl mx-auto pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/user/approved')}
              className="p-2 bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg transition">
              <ArrowLeft size={18} className="text-gray-600" />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <History className="text-purple-600" size={24} />
                Appointment History
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{pastBookings.length} past consultations</p>
            </div>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by doctor or issue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#2ADA71] transition"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500 flex-shrink-0" />
            <select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#2ADA71] transition bg-white"
            >
              <option value="all">All</option>
              <option value="reviewed">Reviewed</option>
              <option value="unreviewed">Not Reviewed</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl border-2 border-gray-100 p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-40" />
                    <div className="h-3 bg-gray-100 rounded w-28" />
                    <div className="h-3 bg-gray-100 rounded w-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <History className="mx-auto text-gray-300 mb-3" size={48} />
            <p className="text-gray-500 font-medium">
              {searchQuery || filterRating !== 'all' ? 'No results found' : 'No appointment history'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {searchQuery || filterRating !== 'all' ? 'Try adjusting your search or filter' : 'Your completed appointments will appear here'}
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm divide-y overflow-hidden">
            {filteredBookings.map(b => {
              const adminIdStr = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
              const admin = adminDetails[adminIdStr];
              const review = reviews[b._id];

              return (
                <div key={b._id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-3">
                    {admin?.profilePhoto ? (
                      <img src={admin.profilePhoto} alt={admin.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" loading="lazy" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0">
                        <User className="text-white" size={20} />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Top Row */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">
                            Dr. {admin?.name || 'Unknown Doctor'}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">{admin?.specialization || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            Completed
                          </span>
                          {b.paid && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Paid
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Date + Time */}
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {formatDate(b.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} /> {b.time}
                        </span>
                      </div>

                      {/* Issue */}
                      <p className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 mb-2 line-clamp-1">
                        <span className="text-gray-400 font-medium">Issue: </span>{b.issue}
                      </p>

                      {/* Review */}
                      {review ? (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-3 py-2">
                          <div className="flex items-center gap-1 mb-0.5">
                            {renderStars(review.rating)}
                            <span className="text-xs text-gray-500 ml-1">Your Rating</span>
                          </div>
                          <p className="text-xs text-gray-600 italic line-clamp-1">"{review.review}"</p>
                        </div>
                      ) : b.paid && (
                        <button onClick={() => openReviewModal(b, admin)}
                          className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs rounded-lg font-semibold transition flex items-center gap-1">
                          <Star size={11} /> Write Review
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedBookingForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-5 rounded-t-2xl relative">
              <button onClick={closeReviewModal} disabled={submittingReview}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition">
                <X size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Write a Review</h3>
                  <p className="text-xs text-white/80">Dr. {selectedBookingForReview.doctorName}</p>
                </div>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">How was your experience?</label>
                <div className="flex justify-center gap-2 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110">
                      <Star size={36} className={star <= (hoverRating || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
                <p className="text-center text-xs text-gray-500">
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating] || 'Select a rating'}
                </p>
              </div>
              <div className="mb-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Share your experience</label>
                <textarea rows="4" value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  maxLength={500} placeholder="Tell us about your consultation..."
                  className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none text-sm" />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-gray-400">Min. 10 characters</p>
                  <p className="text-xs text-gray-400">{reviewText.length}/500</p>
                </div>
              </div>
              <button onClick={handleSubmitReview}
                disabled={submittingReview || rating === 0 || reviewText.trim().length < 10}
                className={`w-full py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm ${
                  submittingReview || rating === 0 || reviewText.trim().length < 10
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg'
                }`}>
                {submittingReview ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Submitting...</>
                ) : (
                  <><Send size={16} /> Submit Review</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default UserAppointmentHistory;
