import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import UserNavbar from './UserNavbar';
import axiosInstance from '../../axiosInstance';
import { 
  Clock, 
  History, 
  Calendar,
  Video,
  CheckCircle,
  AlertCircle,
  X,
  CreditCard,
  User,
  Star,
  Send
} from 'lucide-react';
import Footer from '../Footer';

// Memoized Booking Card Component
const BookingCard = memo(({ 
  booking, 
  admin, 
  onPayment, 
  canJoin, 
  timeRemaining, 
  formatDate, 
  isToday 
}) => {
  const adminIdString = typeof booking.adminId === 'object' ? booking.adminId._id : booking.adminId;
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
        isToday(booking.date) ? 'border-[#2ADA71] ring-2 ring-green-100' : 'border-gray-100'
      }`}
    >
      {/* Header with Status */}
      <div className={`p-3 ${isToday(booking.date) ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isToday(booking.date) ? 'bg-[#2ADA71]' : 'bg-blue-500'}`}>
              <Calendar className="text-white" size={16} />
            </div>
            <div>
              <p className={`font-bold text-sm ${isToday(booking.date) ? 'text-[#2ADA71]' : 'text-gray-800'}`}>
                {formatDate(booking.date)}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Clock size={12} />
                {booking.time}
              </p>
            </div>
          </div>
          {isToday(booking.date) && (
            <span className="px-2 py-1 bg-[#2ADA71] text-white text-xs font-bold rounded-full animate-pulse">
              TODAY
            </span>
          )}
        </div>
      </div>

      {/* Doctor Info */}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {admin?.profilePhoto ? (
            <img
              src={admin.profilePhoto}
              alt={admin.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
              loading="lazy"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
              <User className="text-white" size={24} />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-base font-bold text-gray-800">
              Dr. {admin?.name || 'Unknown Doctor'}
            </h4>
            <p className="text-sm text-gray-600 mb-1">{admin?.specialization || 'N/A'}</p>
            <div className="flex items-center gap-2">
              {booking.paid ? (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <CheckCircle size={12} />
                  Paid
                </span>
              ) : (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full flex items-center gap-1">
                  <Clock size={12} />
                  Payment Pending
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Issue Card */}
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">
            Your Concern
          </p>
          <p className="text-gray-700 text-sm">{booking.issue}</p>
        </div>

        {/* Action Buttons */}
        {booking.paid && booking.meetingLink && (
          <>
            {canJoin ? (
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noreferrer"
                className="text-center bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white px-4 py-2.5 rounded-xl transition font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                <Video size={18} />
                Join Meeting Now
              </a>
            ) : (
              <div>
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-600 px-4 py-2.5 rounded-xl cursor-not-allowed font-semibold flex items-center justify-center gap-2 mb-2"
                >
                  <Video size={18} />
                  Meeting Not Started
                </button>
                <div className="p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200">
                  <div className="flex items-center justify-center gap-2 text-sm text-orange-700 font-medium mb-1">
                    <Clock size={14} />
                    <span>Available in: <strong>{timeRemaining}</strong></span>
                  </div>
                  <p className="text-xs text-center text-orange-600">
                    You can join 10 minutes before your scheduled time
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {booking.paid && !booking.meetingLink && (
          <div className="p-3 bg-blue-50 rounded-xl text-center border border-blue-200">
            <AlertCircle className="mx-auto text-blue-600 mb-2" size={28} />
            <p className="text-sm text-blue-700 font-medium">
              Doctor will add the meeting link soon
            </p>
            <p className="text-xs text-blue-600 mt-1">
              You'll be notified once it's available
            </p>
          </div>
        )}

        {!booking.paid && (
          <button
            onClick={() => onPayment(booking)}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2.5 rounded-xl transition font-semibold flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            <CreditCard size={18} />
            Complete Payment - ₹500
          </button>
        )}
      </div>
    </div>
  );
});

BookingCard.displayName = 'BookingCard';

// Skeleton Loader Component
const BookingSkeleton = () => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-100 animate-pulse">
    <div className="p-3 bg-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gray-300 rounded-lg" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-24 mb-1" />
          <div className="h-3 bg-gray-300 rounded w-16" />
        </div>
      </div>
    </div>
    <div className="p-4">
      <div className="flex gap-3 mb-3">
        <div className="w-12 h-12 bg-gray-300 rounded-full" />
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-32 mb-2" />
          <div className="h-3 bg-gray-300 rounded w-24" />
        </div>
      </div>
      <div className="h-20 bg-gray-100 rounded-lg mb-3" />
      <div className="h-10 bg-gray-200 rounded-xl" />
    </div>
  </div>
);

const Approved = () => {
  const userId = localStorage.getItem('id');
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [adminDetails, setAdminDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review states
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviews, setReviews] = useState({});
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Update timer every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // OPTIMIZED: Fetch all data in parallel
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch bookings
      const bookingsRes = await axiosInstance.get(`/bookings/user/${userId}`);
      const approved = bookingsRes.data.filter(b => b.status === 'Approved');

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = [];
      const past = [];

      approved.forEach(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);

        if (bookingDate >= now) {
          upcoming.push(b);
        } else {
          past.push(b);
        }
      });

      // OPTIMIZED: Collect unique admin IDs
      const uniqueAdminIds = [...new Set(
        approved.map(b => typeof b.adminId === 'object' ? b.adminId._id : b.adminId)
      )];

      // OPTIMIZED: Fetch all admin details in parallel
      const adminPromises = uniqueAdminIds.map(adminId =>
        axiosInstance.get(`/admins/${adminId}`)
          .then(res => ({ id: adminId, data: res.data }))
          .catch(err => {
            console.error(`Error fetching admin ${adminId}:`, err);
            return { id: adminId, data: null };
          })
      );

      const adminResults = await Promise.all(adminPromises);
      const adminData = {};
      adminResults.forEach(({ id, data }) => {
        adminData[id] = data;
      });

      // OPTIMIZED: Fetch reviews for past bookings in parallel
      const reviewPromises = past.map(async (b) => {
        try {
          const canReviewRes = await axiosInstance.get(
            `/api/reviews/can-review/${b._id}?userId=${userId}`
          );
          
          if (canReviewRes.data.canReview === false && 
              canReviewRes.data.reason === 'Already reviewed') {
            const adminIdString = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
            const reviewsRes = await axiosInstance.get(`/api/reviews/doctor/${adminIdString}`);
            const userReview = reviewsRes.data.find(r => r.bookingId === b._id);
            return { bookingId: b._id, review: userReview };
          }
          return { bookingId: b._id, review: null };
        } catch (error) {
          console.error('Error fetching review:', error);
          return { bookingId: b._id, review: null };
        }
      });

      const reviewResults = await Promise.all(reviewPromises);
      const reviewsMap = {};
      reviewResults.forEach(({ bookingId, review }) => {
        if (review) reviewsMap[bookingId] = review;
      });

      setAdminDetails(adminData);
      setUpcomingBookings(upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setPastBookings(past.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setReviews(reviewsMap);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to load appointments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handlePayment = async (bookingId) => {
    setPaymentProcessing(true);
    try {
      await axiosInstance.post(`/bookings/pay/${bookingId}`);
      setUpcomingBookings(prev =>
        prev.map(b => b._id === bookingId ? { ...b, paid: true } : b)
      );
      setShowModal(false);
      setSelectedBooking(null);
      alert('Payment successful! ✅');
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  // OPTIMIZED: Memoize expensive calculations
  const canJoinMeeting = useCallback((booking) => {
    try {
      const bookingDate = new Date(booking.date);
      const [timeStr, period] = booking.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      bookingDate.setHours(hour24, minutes, 0, 0);
      const tenMinutesBefore = new Date(bookingDate.getTime() - 10 * 60000);
      
      return currentTime >= tenMinutesBefore;
    } catch (error) {
      console.error('Error parsing date/time:', error);
      return false;
    }
  }, [currentTime]);

  const getTimeUntilMeeting = useCallback((booking) => {
    try {
      const bookingDate = new Date(booking.date);
      const [timeStr, period] = booking.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) {
        hour24 = hours + 12;
      } else if (period === 'AM' && hours === 12) {
        hour24 = 0;
      }
      
      bookingDate.setHours(hour24, minutes, 0, 0);
      const diff = bookingDate - currentTime;
      
      if (diff < 0) return 'Meeting time has passed';
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours24 = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours24}h ${mins}m`;
      if (hours24 > 0) return `${hours24}h ${mins}m`;
      return `${mins}m`;
    } catch (error) {
      return 'Invalid time';
    }
  }, [currentTime]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  }, []);

  const isToday = useCallback((dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  const openReviewModal = useCallback((booking, admin) => {
    const adminIdString = typeof booking.adminId === 'object' ? booking.adminId._id : booking.adminId;
    setSelectedBookingForReview({ 
      ...booking, 
      doctorName: admin.name,
      adminId: adminIdString 
    });
    setReviewModalOpen(true);
    setRating(0);
    setHoverRating(0);
    setReviewText('');
  }, []);

  const closeReviewModal = useCallback(() => {
    setReviewModalOpen(false);
    setSelectedBookingForReview(null);
    setRating(0);
    setReviewText('');
  }, []);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    if (reviewText.trim().length < 10) {
      alert('Please write at least 10 characters');
      return;
    }

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
      fetchBookings();
    } catch (error) {
      console.error('Error submitting review:', error);
      if (error.response?.status === 409) {
        alert('You have already reviewed this appointment');
      } else if (error.response?.status === 403) {
        alert('Invalid booking. You can only review your own appointments.');
      } else {
        alert('Failed to submit review. Please try again.');
      }
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={14}
        className={index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  // Memoize stats
  const stats = useMemo(() => ({
    total: upcomingBookings.length,
    paid: upcomingBookings.filter(b => b.paid).length,
    completed: pastBookings.length
  }), [upcomingBookings, pastBookings]);

  if (error) {
    return (
      <>
        <UserNavbar />
        <div className="pt-28 px-4 max-w-7xl mx-auto pb-10">
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h3 className="text-xl font-bold text-red-800 mb-2">Something went wrong</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchBookings}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="pt-28 px-4 max-w-7xl mx-auto pb-10">
        {/* Header Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">My Appointments</h2>
          <p className="text-gray-600">Manage your upcoming and past consultations</p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 p-5 rounded-xl animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium mb-1">Total Upcoming</p>
                  <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <Calendar className="text-blue-500" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium mb-1">Paid & Confirmed</p>
                  <p className="text-3xl font-bold text-green-700">{stats.paid}</p>
                </div>
                <CheckCircle className="text-green-500" size={40} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium mb-1">Completed</p>
                  <p className="text-3xl font-bold text-purple-700">{stats.completed}</p>
                </div>
                <History className="text-purple-500" size={40} />
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Appointments Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">Upcoming Appointments</h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[1, 2].map(i => (
                <BookingSkeleton key={i} />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-500 text-lg font-medium mb-2">No upcoming appointments</p>
              <p className="text-gray-400 text-sm">Book a consultation with our doctors</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {upcomingBookings.map(b => {
                const adminIdString = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
                const admin = adminDetails[adminIdString];
                
                return (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    admin={admin}
                    onPayment={(booking) => {
                      setSelectedBooking(booking);
                      setShowModal(true);
                    }}
                    canJoin={canJoinMeeting(b)}
                    timeRemaining={getTimeUntilMeeting(b)}
                    formatDate={formatDate}
                    isToday={isToday}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* History Section */}
        {!loading && pastBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <History className="text-purple-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Appointment History</h3>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
                {pastBookings.length} completed
              </span>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-md divide-y overflow-hidden">
              {pastBookings.map(b => {
                const adminIdString = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
                const admin = adminDetails[adminIdString];
                const review = reviews[b._id];
                
                return (
                  <div key={b._id} className="p-4 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-3">
                      {admin?.profilePhoto ? (
                        <img
                          src={admin.profilePhoto}
                          alt={admin.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                          <User className="text-white" size={24} />
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              Dr. {admin?.name || 'Unknown Doctor'}
                            </h4>
                            <p className="text-xs text-gray-500">{admin?.specialization || 'N/A'}</p>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} className="text-gray-400" />
                            {formatDate(b.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} className="text-gray-400" />
                            {b.time}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 mb-2">
                          <span className="text-gray-500">Issue: </span>
                          {b.issue}
                        </p>

                        {review && (
                          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-2">
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(review.rating)}
                              <span className="text-xs text-gray-600 ml-2">Your Rating</span>
                            </div>
                            <p className="text-sm text-gray-700 italic">"{review.review}"</p>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                            Completed
                          </span>
                          {b.paid && (
                            <>
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                                Paid
                              </span>
                              {!review && (
                                <button
                                  onClick={() => openReviewModal(b, admin)}
                                  className="ml-auto px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs rounded-lg font-semibold transition flex items-center gap-1"
                                >
                                  <Star size={14} />
                                  Write Review
                                </button>
                              )}
                              {review && (
                                <span className="ml-auto px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded font-medium flex items-center gap-1">
                                  <Star size={12} className="fill-yellow-700" />
                                  Reviewed
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <CreditCard className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Confirm Payment</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white transition p-1 hover:bg-white/20 rounded-lg"
                  disabled={paymentProcessing}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-5 rounded-xl border border-blue-200 mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Appointment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-800">{selectedBooking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-800">{selectedBooking.time}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-2">
                    <p className="text-gray-600 mb-1">Your Concern:</p>
                    <p className="text-gray-800">{selectedBooking.issue}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-xl border-2 border-green-200 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Consultation Fee:</span>
                  <span className="text-3xl font-bold text-green-600">₹500</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition"
                  disabled={paymentProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePayment(selectedBooking._id)}
                  disabled={paymentProcessing}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    paymentProcessing
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-200'
                  }`}
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedBookingForReview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-2xl relative">
              <button
                onClick={closeReviewModal}
                className="absolute top-4 right-4 text-white hover:text-gray-200 transition"
                disabled={submittingReview}
              >
                <X size={24} />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Star className="text-yellow-500 fill-yellow-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Write a Review</h3>
                  <p className="text-sm text-white/80">Dr. {selectedBookingForReview.doctorName}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
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

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Share your experience
                </label>
                <textarea
                  rows="5"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  maxLength={500}
                  placeholder="Tell us about your consultation with the doctor..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Minimum 10 characters</p>
                  <p className="text-xs text-gray-500">{reviewText.length}/500</p>
                </div>
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || rating === 0 || reviewText.trim().length < 10}
                className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                  submittingReview || rating === 0 || reviewText.trim().length < 10
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-lg'
                }`}
              >
                {submittingReview ? (
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
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
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
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
      <Footer />
    </>
  );
};

export default Approved;
