import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Calendar, Clock, User } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import UserNavbar from './UserNavbar';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get('booking_id');

  useEffect(() => {
    if (bookingId) {
      checkBookingStatus();
    }
  }, [bookingId]);

  const checkBookingStatus = async () => {
    try {
      const response = await axiosInstance.get(`/bookings/${bookingId}`);
      setBooking(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching booking:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ADA71] mb-4"></div>
            <p className="text-gray-500 text-xl">Confirming your booking...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <CheckCircle className="text-green-600" size={64} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your appointment has been confirmed</p>
          </div>

          {booking && (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <User className="text-[#2ADA71]" size={20} />
                  <p className="text-sm font-semibold text-gray-700">Doctor</p>
                </div>
                <p className="text-gray-800 ml-8">Dr. {booking.adminId?.name}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-[#2ADA71]" size={20} />
                  <p className="text-sm font-semibold text-gray-700">Date</p>
                </div>
                <p className="text-gray-800 ml-8">{booking.date}</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="text-[#2ADA71]" size={20} />
                  <p className="text-sm font-semibold text-gray-700">Time</p>
                </div>
                <p className="text-gray-800 ml-8">{booking.time}</p>
              </div>

              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold text-gray-700">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">₹{booking.amount}</p>
                </div>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              📧 A confirmation email has been sent. The doctor will add the meeting link soon.
            </p>
          </div>

          <button
            onClick={() => navigate('/user/approved')}
            className="w-full bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white py-3 rounded-lg font-semibold transition"
          >
            View My Appointments
          </button>
        </div>
      </div>
    </>
  );
}
