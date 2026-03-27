import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import axiosInstance from '../../axiosInstance';

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');

  const [status, setStatus] = useState('verifying'); // verifying | success | failed

  useEffect(() => {
    if (!sessionId || !bookingId) {
      navigate('/');
      return;
    }

    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const res = await axiosInstance.post('/api/verify-payment', {
        sessionId,
        bookingId,
      });

      if (res.data.success && res.data.paid) {
        setStatus('success');
        setTimeout(() => navigate('/user/approved'), 3000);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">

        {status === 'verifying' && (
          <>
            <Loader className="animate-spin mx-auto text-green-500 mb-4" size={52} />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Verifying Payment...</h2>
            <p className="text-sm text-gray-500">Please wait, do not close this page.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="mx-auto text-green-500 mb-4" size={72} />
            <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed! 🎉</h2>
            <p className="text-gray-600 mb-1">Payment successful</p>
            <p className="text-sm text-gray-500 mb-6">
              The doctor will add a meeting link soon.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-green-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Redirecting to your appointments...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="mx-auto text-red-400 mb-4" size={72} />
            <h2 className="text-xl font-bold text-gray-700 mb-2">Verification Failed</h2>
            <p className="text-sm text-gray-500 mb-6">
              We couldn't confirm your payment. If money was deducted, contact support.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={verifyPayment}
                className="bg-[#2ADA71] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#25c063] transition"
              >
                Retry
              </button>
              <button
                onClick={() => navigate('/user/approved')}
                className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                My Appointments
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
