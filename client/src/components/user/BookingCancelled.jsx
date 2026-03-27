import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';

export default function BookingCancelled() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking_id');

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="text-center p-10 bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        <XCircle className="mx-auto text-red-400 mb-4" size={64} />
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Payment Cancelled</h2>
        <p className="text-gray-500 mb-6">Your booking was not confirmed. No charge was made.</p>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#2ADA71] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#25c063] transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
