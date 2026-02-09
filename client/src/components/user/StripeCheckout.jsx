import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  BadgeCheck, 
  Clock, 
  Info, 
  X, 
  Shield,
  AlertTriangle,
  Star,
  ThumbsUp,
  Award,
  CheckCircle,
  User as UserIcon,
  Calendar
} from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import UserNavbar from './UserNavbar';
import Footer from '../Footer';
import StripeCheckout from './StripeCheckout';

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [admin, setAdmin] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [issue, setIssue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [reviewsFilter, setReviewsFilter] = useState('all');

  const fetchBookedSlots = () => {
    axiosInstance
      .get(`/bookings/admin/${id}`)
      .then(res => {
        const bookedAppointments = res.data.filter(
          b => (b.status === 'Approved' || b.status === 'pending') && b.paid === true
        );
        setBookedSlots(bookedAppointments);
      })
      .catch(error => {
        console.error('Error fetching bookings:', error);
      });
  };

  const fetchReviews = async () => {
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        axiosInstance.get(`/api/reviews/doctor/${id}`),
        axiosInstance.get(`/api/reviews/stats/${id}`)
      ]);
      
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  useEffect(() => {
    if (!id || id === '[object Object]') {
      console.error('Invalid admin ID!');
      return;
    }
    
    axiosInstance
      .get(`/admins/${id}`)
      .then(res => {
        setAdmin(res.data);
      })
      .catch(error => {
        console.error('Error fetching admin:', error);
        setAdmin(null);
      });

    fetchBookedSlots();
    fetchReviews();
  }, [id]);

  const getNext7Days = () => {
    const days = [];
    const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        label: weekDays[date.getDay()],
        date: date.getDate(),
        fullDate: new Date(date),
      });
    }
    return days;
  };

  const generateTimeSlots = (isToday, selectedDate) => {
    const slots = [];
    const now = new Date();
    
    const formattedSelectedDate = selectedDate.toLocaleDateString('en-IN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const bookedTimesForDate = bookedSlots
      .filter(booking => booking.date === formattedSelectedDate)
      .map(booking => booking.time);

    for (let hour = 9; hour <= 20; hour++) {
      const slotTime = new Date();
      slotTime.setHours(hour, 0, 0, 0);
      
      const timeString = slotTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      const isValidSlot = (!isToday || slotTime > now) && !bookedTimesForDate.includes(timeString);
      
      if (isValidSlot) {
        slots.push(timeString);
      }
    }
    return slots;
  };

  const next7Days = getNext7Days();
  const selectedDay = next7Days[selectedDateIndex];
  const isToday = selectedDateIndex === 0;
  const timeSlots = generateTimeSlots(isToday, selectedDay.fullDate);

  const formattedDate = selectedDay.fullDate.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleBookNow = () => {
    const userId = localStorage.getItem('id');
    if (!userId) {
      alert('Please login to book an appointment');
      navigate('/login');
      return;
    }
    if (selectedTime) setIsModalOpen(true);
  };

  const handleProceedToPayment = async () => {
    if (!issue.trim()) {
      alert('Please describe your issue');
      return;
    }

    setPaymentProcessing(true);

    try {
      const userId = localStorage.getItem('id');
      
      // Create booking first
      const response = await axiosInstance.post('/api/booking', {
        userId: userId,
        adminId: id,
        date: formattedDate,
        time: selectedTime,
        issue: issue.trim(),
        amount: 500
      });

      // Store booking data for payment
      setBookingData({
        bookingId: response.data.bookingId,
        amount: 500,
        userId: userId,
        adminId: id,
        date: formattedDate,
        time: selectedTime,
        doctorName: `Dr. ${admin.name}`,
        patientName: localStorage.getItem('name') || 'Patient',
        patientEmail: localStorage.getItem('email') || '',
      });

      setShowPayment(true);
      setPaymentProcessing(false);
    } catch (error) {
      setPaymentProcessing(false);
      console.error('Booking error:', error);
      
      if (error.response?.status === 409) {
        alert('⚠️ Sorry! This time slot was just booked by someone else. Please select another time slot.');
        setIsModalOpen(false);
        setSelectedTime(null);
        fetchBookedSlots();
      } else {
        alert('Booking failed. Please try again.');
      }
    }
  };

  const handlePaymentSuccess = (paymentIntentId) => {
    setPaymentProcessing(true);
    
    // Poll for payment confirmation
    const checkPaymentStatus = setInterval(async () => {
      try {
        const response = await axiosInstance.get(`/api/payment-status/${bookingData.bookingId}`);
        
        if (response.data.paid && response.data.status === 'Approved') {
          clearInterval(checkPaymentStatus);
          setPaymentProcessing(false);
          setIsModalOpen(false);
          setShowPayment(false);
          
          alert('✅ Payment successful! Your booking is confirmed. The doctor will add the meeting link soon.');
          
          setIssue('');
          setSelectedTime(null);
          setSelectedDateIndex(0);
          setBookingData(null);
          
          navigate('/user/approved');
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    }, 2000);

    setTimeout(() => {
      clearInterval(checkPaymentStatus);
      setPaymentProcessing(false);
    }, 30000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setShowPayment(false);
    setPaymentProcessing(false);
    setBookingData(null);
  };

  const markHelpful = async (reviewId) => {
    try {
      await axiosInstance.patch(`/api/reviews/${reviewId}/helpful`);
      fetchReviews();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const getFilteredReviews = () => {
    if (reviewsFilter === 'all') return reviews;
    return reviews.filter(r => r.rating === parseInt(reviewsFilter));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        size={16}
        className={index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
      />
    ));
  };

  const filteredReviews = getFilteredReviews();

  if (!admin)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ADA71] mb-4"></div>
          <p className="text-gray-500 text-xl">Loading doctor details...</p>
        </div>
      </div>
    );

  return (
    <>
      <UserNavbar />
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen">
        <div className="max-w-7xl mx-auto p-6 pt-28 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-28">
                <div className="relative mb-4">
                  <img
                    src={admin.profilePhoto}
                    alt={admin.name}
                    className="w-full aspect-square object-contain rounded-xl"
                  />
                  {stats && stats.averageRating > 0 && (
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg">
                      <div className="flex items-center gap-2">
                        <Star className="text-yellow-500 fill-yellow-500" size={20} />
                        <div>
                          <p className="text-lg font-bold text-gray-800">{stats.averageRating}</p>
                          <p className="text-xs text-gray-600">{stats.totalReviews} reviews</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2 mb-2">
                    Dr. {admin.name}
                    <BadgeCheck size={24} className="text-blue-600" />
                  </h2>
                  <p className="text-gray-700 font-medium mb-2">{admin.specialization}</p>
                  <span className="inline-block bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-sm font-semibold px-4 py-2 rounded-full border border-green-200">
                    {admin.experienceYears} Years Experience
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      Committed to providing quality mental healthcare with compassion and empathy.
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Consultation Fee</p>
                    <p className="text-3xl font-bold text-green-600">₹500</p>
                  </div>
                </div>

                {stats && stats.totalReviews > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-gray-700">Patient Satisfaction</span>
                      <span className="text-sm font-bold text-green-600">
                        {Math.round((stats.ratingDistribution[4] + stats.ratingDistribution[5]) / stats.totalReviews * 100)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = stats.ratingDistribution[star] || 0;
                        const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews * 100) : 0;
                        
                        return (
                          <div key={star} className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-600 w-8">{star} ★</span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-8 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="text-[#2ADA71]" size={24} />
                  Select Date & Time
                </h3>

                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Choose Date</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {next7Days.map((slot, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSelectedDateIndex(idx);
                          setSelectedTime(null);
                        }}
                        className={`min-w-[70px] h-20 rounded-xl flex flex-col items-center justify-center cursor-pointer font-semibold text-sm transition-all border-2 ${
                          selectedDateIndex === idx 
                            ? 'bg-gradient-to-br from-[#2ADA71] to-[#25c063] text-white border-[#2ADA71] shadow-lg shadow-green-200' 
                            : 'bg-white text-gray-800 border-gray-200 hover:border-[#2ADA71] hover:shadow-md'
                        }`}
                      >
                        <div className="text-xs">{slot.label}</div>
                        <div className="text-lg">{slot.date}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Available Time Slots</p>
                  <div className="flex gap-3 flex-wrap">
                    {timeSlots.length === 0 ? (
                      <div className="w-full p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">No available slots</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            All slots for this date are booked. Please select another date.
                          </p>
                        </div>
                      </div>
                    ) : (
                      timeSlots.map((time, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTime(time)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-all border-2 ${
                            selectedTime === time
                              ? 'bg-gradient-to-r from-[#2ADA71] to-[#25c063] text-white border-[#2ADA71] shadow-lg shadow-green-200'
                              : 'bg-white text-gray-700 border-gray-200 hover:border-[#2ADA71] hover:shadow-md'
                          }`}
                        >
                          <Clock size={16} />
                          {time}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={handleBookNow}
                    className={`w-full ${
                      selectedTime 
                        ? 'bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] shadow-lg shadow-green-200' 
                        : 'bg-gray-300 cursor-not-allowed'
                    } px-6 py-4 rounded-xl text-white font-bold text-lg transition-all flex items-center justify-center gap-2`}
                    disabled={!selectedTime}
                  >
                    <CheckCircle size={20} />
                    Book Appointment Now
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Star className="text-yellow-500" size={24} />
                    Patient Reviews & Ratings
                  </h3>
                  {stats && stats.totalReviews > 0 && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-800">{stats.averageRating} / 5</p>
                      <p className="text-xs text-gray-600">{stats.totalReviews} reviews</p>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="mx-auto text-gray-300 mb-4" size={64} />
                    <p className="text-gray-500 font-medium mb-2">No reviews yet</p>
                    <p className="text-sm text-gray-400">Be the first to review Dr. {admin.name}</p>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                      <button
                        onClick={() => setReviewsFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                          reviewsFilter === 'all'
                            ? 'bg-[#2ADA71] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        All ({reviews.length})
                      </button>
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        if (count === 0) return null;
                        
                        return (
                          <button
                            key={star}
                            onClick={() => setReviewsFilter(star.toString())}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition flex items-center gap-1 ${
                              reviewsFilter === star.toString()
                                ? 'bg-[#2ADA71] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {star} ★ ({count})
                          </button>
                        );
                      })}
                    </div>

                    <div className="space-y-4">
                      {filteredReviews.slice(0, 10).map((review, idx) => (
                        <div key={idx} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              {review.patientId?.profilePhoto ? (
                                <img
                                  src={review.patientId.profilePhoto}
                                  alt={review.patientId.name}
                                  className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                                  <UserIcon className="text-white" size={20} />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-gray-800">{review.patientId?.name || 'Anonymous'}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                            </div>
                            {review.verified && (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
                                <CheckCircle size={12} />
                                Verified
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 mb-2">
                            {renderStars(review.rating)}
                          </div>

                          <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.review}</p>

                          <button
                            onClick={() => markHelpful(review._id)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#2ADA71] transition"
                          >
                            <ThumbsUp size={16} />
                            <span>Helpful ({review.helpful || 0})</span>
                          </button>
                        </div>
                      ))}
                    </div>

                    {filteredReviews.length > 10 && (
                      <div className="text-center mt-6">
                        <button className="text-[#2ADA71] hover:underline font-medium">
                          View all {filteredReviews.length} reviews
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl relative">
            {!showPayment ? (
              <div className="p-6">
                <button 
                  onClick={closeModal} 
                  className="absolute top-4 right-4 text-gray-500 hover:text-black transition"
                  disabled={paymentProcessing}
                >
                  <X size={20} />
                </button>
                
                <h2 className="text-xl font-bold mb-6 text-gray-800">Confirm Booking</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Doctor</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200">
                    Dr. {admin.name} - {admin.specialization}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Selected Date</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200">
                    {formattedDate}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Selected Time</label>
                  <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-800 border border-gray-200">
                    {selectedTime}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-gray-700">Describe your issue *</label>
                  <textarea
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none"
                    placeholder="e.g. Feeling anxious lately, having trouble sleeping..."
                    value={issue}
                    onChange={e => setIssue(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={closeModal}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
                    disabled={paymentProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceedToPayment}
                    disabled={!issue.trim() || paymentProcessing}
                    className={`px-5 py-2.5 rounded-lg text-white text-sm font-medium transition ${
                      issue.trim() && !paymentProcessing
                        ? 'bg-[#2ADA71] hover:bg-[#25c063]' 
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {paymentProcessing ? 'Creating...' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            ) : (
              bookingData && (
                <StripeCheckout
                  bookingData={bookingData}
                  onSuccess={handlePaymentSuccess}
                  onCancel={closeModal}
                />
              )
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
