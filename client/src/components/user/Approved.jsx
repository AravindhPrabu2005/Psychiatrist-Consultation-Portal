import React, { useEffect, useState, useMemo, useCallback, memo } from 'react';
import UserNavbar from './UserNavbar';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Clock, History, Calendar, Video, CheckCircle,
  AlertCircle, X, CreditCard, User, Star, Send
} from 'lucide-react';
import Footer from '../Footer';

// ─── Booking Card ───────────────────────────────────────────────────────────
const BookingCard = memo(({ booking, admin, onPayment, canJoin, timeRemaining, formatDate, isToday }) => (
  <div className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2 ${
    isToday(booking.date) ? 'border-[#2ADA71] ring-2 ring-green-100' : 'border-gray-100'
  }`}>
    {/* Header */}
    <div className={`px-4 py-3 ${isToday(booking.date) ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isToday(booking.date) ? 'bg-[#2ADA71]' : 'bg-blue-500'}`}>
            <Calendar className="text-white" size={14} />
          </div>
          <div>
            <p className={`font-bold text-sm ${isToday(booking.date) ? 'text-[#2ADA71]' : 'text-gray-800'}`}>
              {formatDate(booking.date)}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Clock size={11} /> {booking.time}
            </p>
          </div>
        </div>
        {isToday(booking.date) && (
          <span className="px-2 py-0.5 bg-[#2ADA71] text-white text-xs font-bold rounded-full animate-pulse">
            TODAY
          </span>
        )}
      </div>
    </div>

    {/* Body */}
    <div className="p-3">
      <div className="flex items-center gap-3 mb-3">
        {admin?.profilePhoto ? (
          <img src={admin.profilePhoto} alt={admin.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0" loading="lazy" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-md flex-shrink-0">
            <User className="text-white" size={18} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-gray-800 truncate">Dr. {admin?.name || 'Unknown Doctor'}</h4>
          <p className="text-xs text-gray-500 truncate">{admin?.specialization || 'N/A'}</p>
          <div className="mt-1">
            {booking.paid ? (
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full inline-flex items-center gap-1">
                <CheckCircle size={10} /> Paid
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full inline-flex items-center gap-1">
                <Clock size={10} /> Payment Pending
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mb-3 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Your Concern</p>
        <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">{booking.issue}</p>
      </div>

      {booking.paid && booking.meetingLink && (
        canJoin ? (
          <a href={booking.meetingLink} target="_blank" rel="noreferrer"
            className="w-full text-center bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 text-sm">
            <Video size={15} /> Join Meeting Now
          </a>
        ) : (
          <div>
            <button disabled className="w-full bg-gray-200 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed font-semibold flex items-center justify-center gap-2 mb-2 text-sm">
              <Video size={15} /> Meeting Not Started
            </button>
            <div className="px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-center gap-1.5 text-xs text-orange-700 font-medium mb-0.5">
                <Clock size={12} /> <span>Available in: <strong>{timeRemaining}</strong></span>
              </div>
              <p className="text-xs text-center text-orange-500">Join 10 min before your slot</p>
            </div>
          </div>
        )
      )}

      {booking.paid && !booking.meetingLink && (
        <div className="px-3 py-2 bg-blue-50 rounded-lg text-center border border-blue-200">
          <AlertCircle className="mx-auto text-blue-500 mb-1" size={20} />
          <p className="text-xs text-blue-700 font-medium">Doctor will add meeting link soon</p>
        </div>
      )}

      {!booking.paid && (
        <button onClick={() => onPayment(booking)}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 text-sm">
          <CreditCard size={15} /> Complete Payment - ₹500
        </button>
      )}
    </div>
  </div>
));
BookingCard.displayName = 'BookingCard';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const BookingSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-gray-100 animate-pulse">
    <div className="p-3 bg-gray-100">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gray-300 rounded-lg" />
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded w-20 mb-1" />
          <div className="h-2.5 bg-gray-300 rounded w-14" />
        </div>
      </div>
    </div>
    <div className="p-3">
      <div className="flex gap-3 mb-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex-shrink-0" />
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded w-28 mb-2" />
          <div className="h-2.5 bg-gray-300 rounded w-20" />
        </div>
      </div>
      <div className="h-12 bg-gray-100 rounded-lg mb-3" />
      <div className="h-8 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const Approved = () => {
  const userId = localStorage.getItem('id');
  const navigate = useNavigate();

  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [adminDetails, setAdminDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [reviews, setReviews] = useState({});
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const bookingsRes = await axiosInstance.get(`/bookings/user/${userId}`);
      const approved = bookingsRes.data.filter(b => b.status === 'Approved');

      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const upcoming = [];
      const past = [];

      approved.forEach(b => {
        const d = new Date(b.date);
        d.setHours(0, 0, 0, 0);
        if (d >= now) upcoming.push(b);
        else past.push(b);
      });

      const uniqueAdminIds = [...new Set(
        approved.map(b => typeof b.adminId === 'object' ? b.adminId._id : b.adminId)
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
      setUpcomingBookings(upcoming.sort((a, b) => new Date(a.date) - new Date(b.date)));
      setPastBookings(past.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setReviews(reviewsMap);
    } catch (err) {
      setError('Failed to load appointments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handlePayment = async (bookingId) => {
    setPaymentProcessing(true);
    try {
      await axiosInstance.post(`/bookings/pay/${bookingId}`);
      setUpcomingBookings(prev => prev.map(b => b._id === bookingId ? { ...b, paid: true } : b));
      setShowModal(false);
      setSelectedBooking(null);
      alert('Payment successful! ✅');
    } catch {
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const canJoinMeeting = useCallback((booking) => {
    try {
      const bookingDate = new Date(booking.date);
      const [timeStr, period] = booking.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 = hours + 12;
      else if (period === 'AM' && hours === 12) hour24 = 0;
      bookingDate.setHours(hour24, minutes, 0, 0);
      return currentTime >= new Date(bookingDate.getTime() - 10 * 60000);
    } catch { return false; }
  }, [currentTime]);

  const getTimeUntilMeeting = useCallback((booking) => {
    try {
      const bookingDate = new Date(booking.date);
      const [timeStr, period] = booking.time.split(' ');
      const [hours, minutes] = timeStr.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 = hours + 12;
      else if (period === 'AM' && hours === 12) hour24 = 0;
      bookingDate.setHours(hour24, minutes, 0, 0);
      const diff = bookingDate - currentTime;
      if (diff < 0) return 'Meeting time has passed';
      const days = Math.floor(diff / 86400000);
      const hrs = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      if (days > 0) return `${days}d ${hrs}h ${mins}m`;
      if (hrs > 0) return `${hrs}h ${mins}m`;
      return `${mins}m`;
    } catch { return 'Invalid time'; }
  }, [currentTime]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }, []);

  const isToday = useCallback((dateString) =>
    new Date(dateString).toDateString() === new Date().toDateString(), []);

  const openReviewModal = useCallback((booking, admin) => {
    const adminIdStr = typeof booking.adminId === 'object' ? booking.adminId._id : booking.adminId;
    setSelectedBookingForReview({ ...booking, doctorName: admin.name, adminId: adminIdStr });
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
      fetchBookings();
    } catch (error) {
      if (error.response?.status === 409) alert('You have already reviewed this appointment');
      else alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderStars = (rating) => [...Array(5)].map((_, i) => (
    <Star key={i} size={13} className={i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
  ));

  const stats = useMemo(() => ({
    total: upcomingBookings.length,
    paid: upcomingBookings.filter(b => b.paid).length,
    completed: pastBookings.length
  }), [upcomingBookings, pastBookings]);

  if (error) return (
    <>
      <UserNavbar />
      <div className="pt-24 px-4 max-w-6xl mx-auto pb-10">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-lg font-bold text-red-800 mb-2">Something went wrong</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchBookings} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition">
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
      <div className="pt-24 px-4 max-w-6xl mx-auto pb-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Appointments</h2>
            <p className="text-sm text-gray-500 mt-0.5">Manage your upcoming consultations</p>
          </div>
          <button
            onClick={() => navigate('/user/history')}
            className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition text-sm"
          >
            <History size={17} /> History
          </button>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3].map(i => <div key={i} className="bg-gray-100 p-4 rounded-xl animate-pulse h-20" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs font-medium mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                </div>
                <Calendar className="text-blue-400" size={28} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs font-medium mb-1">Confirmed</p>
                  <p className="text-2xl font-bold text-green-700">{stats.paid}</p>
                </div>
                <CheckCircle className="text-green-400" size={28} />
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs font-medium mb-1">Completed</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.completed}</p>
                </div>
                <History className="text-purple-400" size={28} />
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={18} />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Upcoming Appointments</h3>
            {!loading && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                {upcomingBookings.length}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <BookingSkeleton key={i} />)}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
              <Calendar className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 font-medium">No upcoming appointments</p>
              <p className="text-gray-400 text-sm mt-1">Book a consultation with our doctors</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {upcomingBookings.map(b => {
                const adminIdStr = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
                return (
                  <BookingCard
                    key={b._id}
                    booking={b}
                    admin={adminDetails[adminIdStr]}
                    onPayment={(booking) => { setSelectedBooking(booking); setShowModal(true); }}
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

        {/* Recent History Preview */}
        {!loading && pastBookings.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-purple-100 rounded-lg">
                  <History className="text-purple-600" size={18} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Recent History</h3>
              </div>
              <button
                onClick={() => navigate('/user/history')}
                className="text-sm text-[#2ADA71] hover:underline font-medium"
              >
                View all ({pastBookings.length}) →
              </button>
            </div>

            <div className="bg-white border-2 border-gray-100 rounded-2xl shadow-sm divide-y overflow-hidden">
              {pastBookings.slice(0, 3).map(b => {
                const adminIdStr = typeof b.adminId === 'object' ? b.adminId._id : b.adminId;
                const admin = adminDetails[adminIdStr];
                const review = reviews[b._id];

                return (
                  <div key={b._id} className="p-3 hover:bg-gray-50 transition">
                    <div className="flex items-start gap-3">
                      {admin?.profilePhoto ? (
                        <img src={admin.profilePhoto} alt={admin.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 flex-shrink-0" loading="lazy" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center flex-shrink-0">
                          <User className="text-white" size={18} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">Dr. {admin?.name || 'Unknown'}</h4>
                            <p className="text-xs text-gray-500 truncate">{admin?.specialization || 'N/A'}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">Completed</span>
                            {b.paid && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded font-medium">Paid</span>}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 mb-1.5">
                          <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(b.date)}</span>
                          <span className="flex items-center gap-1"><Clock size={11} />{b.time}</span>
                        </div>
                        {review ? (
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="text-xs text-gray-500 ml-1 truncate">"{review.review}"</span>
                          </div>
                        ) : b.paid && (
                          <button onClick={() => openReviewModal(b, admin)}
                            className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs rounded-lg font-semibold transition flex items-center gap-1">
                            <Star size={11} /> Write Review
                          </button>
                        )}
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
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl transform animate-slideUp">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <CreditCard className="text-white" size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-white">Confirm Payment</h3>
                </div>
                <button onClick={() => setShowModal(false)} disabled={paymentProcessing}
                  className="text-white/80 hover:text-white transition p-1 hover:bg-white/20 rounded-lg">
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                <h4 className="font-semibold text-gray-800 text-sm mb-2">Appointment Details</h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium text-gray-800">{selectedBooking.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Time:</span>
                    <span className="font-medium text-gray-800">{selectedBooking.time}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-2 mt-1">
                    <p className="text-gray-500 text-xs mb-0.5">Your Concern:</p>
                    <p className="text-gray-800 text-sm">{selectedBooking.issue}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium text-sm">Consultation Fee:</span>
                  <span className="text-2xl font-bold text-green-600">₹500</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setShowModal(false); setSelectedBooking(null); }} disabled={paymentProcessing}
                  className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition text-sm">
                  Cancel
                </button>
                <button onClick={() => handlePayment(selectedBooking._id)} disabled={paymentProcessing}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-semibold transition flex items-center justify-center gap-2 text-sm ${
                    paymentProcessing ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-200'
                  }`}>
                  {paymentProcessing ? (
                    <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> Processing...</>
                  ) : (
                    <><CheckCircle size={16} /> Confirm</>
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
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl transform animate-slideUp">
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

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
      <Footer />
    </>
  );
};

export default Approved;
