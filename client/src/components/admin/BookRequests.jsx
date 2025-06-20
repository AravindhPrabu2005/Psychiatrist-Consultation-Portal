import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import axiosInstance from '../../axiosInstance';
import { CalendarDays, Clock } from 'lucide-react';

export default function BookRequests() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState(null);

  const [userModalOpen, setUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const adminId = localStorage.getItem('id');

  useEffect(() => {
    axiosInstance.get(`/bookings/admin/${adminId}`)
      .then(res => {
        setBookings(res.data);
        setFiltered(res.data);
      })
      .catch(() => {
        setBookings([]);
        setFiltered([]);
      });
  }, [adminId]);

  function formatDateToInput(dateStr) {
    return new Date(dateStr).toISOString().split('T')[0];
  }

  function formatTimeTo12Hour(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    const h = parseInt(hours, 10);
    const suffix = h >= 12 ? 'pm' : 'am';
    const formattedHour = ((h % 12) || 12).toString().padStart(2, '0');
    return `${formattedHour}:${minutes} ${suffix}`;
  }

  function filterBookings() {
    const filteredList = bookings.filter(b => {
      const bDate = formatDateToInput(b.date);
      const bTime = b.time;
      const matchDate = selectedDate ? selectedDate === bDate : true;
      const matchTime = selectedTime ? selectedTime === bTime : true;
      return matchDate && matchTime;
    });
    setFiltered(filteredList);
  }

  function handleApprove(id) {
    setCurrentBookingId(id);
    setModalOpen(true);
  }

  function handleSchedule() {
    axiosInstance.post(`/bookings/schedule/${currentBookingId}`, { meetingLink })
      .then(() => {
        setModalOpen(false);
        setMeetingLink('');
      });
  }

  function handleCancel(id) {
    axiosInstance.post(`/bookings/cancel/${id}`).then(() => {
      setFiltered(prev => prev.filter(b => b._id !== id));
    });
  }

  function handleUserDetails(userId) {
    axiosInstance.get(`/users/${userId}`)
      .then(res => {
        setSelectedUser(res.data);
        setUserModalOpen(true);
      })
      .catch(() => {
        alert("User not found");
      });
  }

  return (
    <>
      <AdminNavbar />
      <div className="p-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-[#2A1D7C]">Booking Requests</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-green-700" />
            <input
              type="date"
              className="border border-green-300 rounded px-3 py-2 focus:outline-green-500"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Clock className="text-green-700" />
            <select
              className="border border-green-300 rounded px-3 py-2 focus:outline-green-500"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
            >
              <option value="">All Slots</option>
              {[
                "09:00", "10:00", "11:00", "12:00", "13:00",
                "14:00", "15:00", "16:00", "17:00", "18:00",
                "19:00", "20:00"
              ].map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <button
            onClick={filterBookings}
            className="bg-[#2ADA71] text-white px-5 py-2 rounded hover:brightness-110 transition font-medium"
          >
            Apply Filter
          </button>
        </div>

        {/* Booking List */}
        {filtered.length === 0 ? (
          <div className="text-center text-gray-600 mt-10">
            <p>No booking requests found for the selected criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filtered.map((booking, idx) => (
              <div key={idx} className="border border-green-200 bg-white p-6 rounded-lg shadow-sm">
                <div className="grid sm:grid-cols-2 gap-2 sm:gap-4">
                  <p><span className="font-medium text-green-900">Date:</span> {formatDateToInput(booking.date)}</p>
                  <p><span className="font-medium text-green-900">Time:</span> {formatTimeTo12Hour(booking.time)}</p>
                  <p><span className="font-medium text-green-900">Issue:</span> {booking.issue}</p>
                  <p><span className="font-medium text-green-900">Status:</span> {booking.status}</p>
                  <p><span className="font-medium text-green-900">User ID:</span> {booking.userId}</p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => handleApprove(booking._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                  >
                    Cancel Request
                  </button>
                  <button
                    onClick={() => handleUserDetails(booking.userId)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  >
                    View User Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Schedule Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl border border-green-200">
              <h3 className="text-xl font-bold mb-4 text-[#2A1D7C]">Schedule Meeting</h3>
              <input
                type="text"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.example.com/..."
                className="w-full border border-gray-300 px-3 py-2 rounded mb-4 focus:outline-green-500"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setModalOpen(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={handleSchedule}
                  className="bg-[#2ADA71] text-white px-4 py-2 rounded hover:brightness-110 transition"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        {userModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-xl">
              <h3 className="text-xl font-bold mb-4 text-[#2A1D7C] text-center">User Details</h3>

              {/* Profile Photo */}
              {selectedUser.profilePhoto && (
                <div className="flex justify-center mb-4">
                  <img
                    src={selectedUser.profilePhoto}
                    alt="User Profile"
                    className="w-24 h-24 rounded-full object-cover border border-green-300 shadow"
                  />
                </div>
              )}

              {/* User Info */}
              <div className="space-y-2 text-gray-700">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Gender:</strong> {selectedUser.gender}</p>
                <p><strong>Age:</strong> {selectedUser.age}</p>
                <p><strong>Date of Birth:</strong> {new Date(selectedUser.dob).toLocaleDateString()}</p>
                <p><strong>Phone:</strong> {selectedUser.phone}</p>
                <p><strong>Address:</strong> {selectedUser.address}</p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setUserModalOpen(false)}
                  className="bg-[#2ADA71] text-white px-4 py-2 rounded hover:brightness-110 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </>
  );
}
