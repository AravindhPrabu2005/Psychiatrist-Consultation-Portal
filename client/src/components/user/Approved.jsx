import React, { useEffect, useState } from 'react';
import UserNavbar from './UserNavbar';
import axiosInstance from '../../axiosInstance';

const Approved = () => {
  const userId = localStorage.getItem('id');
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [adminDetails, setAdminDetails] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/bookings/user/${userId}`).then(async res => {
      const approved = res.data.filter(b => b.status === 'Approved');

      // Fetch admin details in parallel
      const adminData = {};
      await Promise.all(
        approved.map(async b => {
          if (!adminData[b.adminId]) {
            try {
              const res = await axiosInstance.get(`/admins/${b.adminId}`);
              adminData[b.adminId] = res.data;
            } catch {
              adminData[b.adminId] = null;
            }
          }
        })
      );

      setAdminDetails(adminData);
      setApprovedBookings(approved);
    });
  }, [userId]);

  const handlePayment = async (bookingId) => {
    await axiosInstance.post(`/bookings/pay/${bookingId}`);
    setApprovedBookings(prev =>
      prev.map(b => b._id === bookingId ? { ...b, paid: true } : b)
    );
  };

  return (
    <>
      <UserNavbar />
      <div className="pt-28 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Approved Appointments</h2>

        {approvedBookings.length === 0 ? (
          <p className="text-gray-500">No approved bookings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvedBookings.map(b => {
              const admin = adminDetails[b.adminId];
              return (
                <div key={b._id} className="bg-white border rounded-xl shadow-md p-6">
                  <div className="flex gap-4 items-center mb-4">
                    {admin?.profilePhoto ? (
                      <img
                        src={admin.profilePhoto}
                        alt={admin.name}
                        className="w-16 h-16 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-300" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Dr. {admin?.name || 'Unknown Doctor'}
                      </h3>
                      <p className="text-sm text-gray-500">{admin?.specialization}</p>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Date:</strong> {b.date}</p>
                    <p><strong>Time:</strong> {b.time}</p>
                    <p><strong>Issue:</strong> {b.issue}</p>
                    <p><strong>Status:</strong> {b.status}</p>
                    <p><strong>Paid:</strong> {b.paid ? '✅ Paid' : '❌ Not Paid'}</p>
                  </div>

                  {b.paid && b.meetingLink && (
                    <a
                      href={b.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center mt-4 bg-[#2ADA71] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Join Meeting
                    </a>
                  )}

                  {!b.paid && (
                    <button
                      onClick={() => {
                        setSelectedBooking(b);
                        setShowModal(true);
                      }}
                      className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                    >
                      Pay ₹500
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md p-6 relative">
            <h3 className="text-xl font-bold mb-4 text-center">Confirm Payment</h3>

            <div className="space-y-2 text-sm">
              <p><strong>Date:</strong> {selectedBooking.date}</p>
              <p><strong>Time:</strong> {selectedBooking.time}</p>
              <p><strong>Amount:</strong> ₹500</p>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handlePayment(selectedBooking._id);
                  setShowModal(false);
                  setSelectedBooking(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Approved;
