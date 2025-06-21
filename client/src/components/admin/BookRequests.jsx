import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import axiosInstance from '../../axiosInstance';
import { CalendarDays, Clock, Video, UserCircle2, Info, Mail, Phone, MapPin } from 'lucide-react';

export default function BookRequests() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [currentBookingId, setCurrentBookingId] = useState(null);

  const adminId = localStorage.getItem('id');

  useEffect(() => {
  axiosInstance.get(`/bookings/admin/${adminId}`)
    .then(res => {
      const bookingsWithUser = Promise.all(
        res.data
          .filter(b => b.status.toLowerCase() === 'pending') // ✅ Only pending bookings
          .map(async b => {
            const user = await axiosInstance.get(`/users/${b.userId}`).then(r => r.data).catch(() => null);
            return { ...b, user };
          })
      );
      bookingsWithUser.then(all => {
        setBookings(all);
        setFiltered(all);
      });
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
  }

  function handleSchedule() {
    axiosInstance.post(`/bookings/schedule/${currentBookingId}`, { meetingLink }).then(() => {
      setMeetingLink('');
      setCurrentBookingId(null);
    });
  }

  function handleCancel(id) {
    axiosInstance.post(`/bookings/cancel/${id}`).then(() => {
      setFiltered(prev => prev.filter(b => b._id !== id));
    });
  }

  return (
    <>
      <AdminNavbar />
      <div className="p-8 max-w-7xl mx-auto pt-28">
        <h2 className="text-4xl font-semibold mb-8 text-[#1E1E2F] tracking-tight">Manage Booking Requests</h2>

        <div className="flex flex-wrap gap-6 mb-10 items-end bg-green-50 p-5 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <CalendarDays className="text-green-700" />
            <input
              type="date"
              className="border border-green-300 rounded px-4 py-2 focus:outline-green-500"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Clock className="text-green-700" />
            <select
              className="border border-green-300 rounded px-4 py-2 focus:outline-green-500"
              value={selectedTime}
              onChange={e => setSelectedTime(e.target.value)}
            >
              <option value="">All Times</option>
              {[...Array(12).keys()].map(i => {
                const hour = 9 + i;
                const time = `${hour.toString().padStart(2, '0')}:00`;
                return <option key={time} value={time}>{time}</option>;
              })}
            </select>
          </div>
          <button
            onClick={filterBookings}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Filter
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center text-gray-500">No bookings available for the selected filters.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((booking, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl shadow border border-gray-200">
                <div className="flex items-center gap-4 mb-4">
                  {booking.user?.profilePhoto ? (
                    <img
                      src={booking.user.profilePhoto}
                      className="w-16 h-16 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <UserCircle2 className="w-16 h-16 text-gray-400" />
                  )}
                  <div>
                    <p className="text-lg font-medium text-gray-900">{booking.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-600">{booking.user?.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <p><span className="font-medium">Date:</span> {formatDateToInput(booking.date)}</p>
                  <p><span className="font-medium">Time:</span> {formatTimeTo12Hour(booking.time)}</p>
                  <p><span className="font-medium">Issue:</span> {booking.issue}</p>
                  <p><span className="font-medium">Status:</span> {booking.status}</p>
                  <p><Mail className="inline w-4 h-4 mr-1 text-gray-500" /> {booking.user?.email}</p>
                  <p><Phone className="inline w-4 h-4 mr-1 text-gray-500" /> {booking.user?.phone}</p>
                  <p><MapPin className="inline w-4 h-4 mr-1 text-gray-500" /> {booking.user?.address}</p>
                </div>

                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    onClick={() => handleApprove(booking._id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleCancel(booking._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                </div>

                {currentBookingId === booking._id && (
                  <div className="mt-4 space-y-2">
                    <input
                      type="text"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="Enter Meeting Link"
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-green-500"
                    />
                    <button
                      onClick={handleSchedule}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      <Video className="w-5 h-5" /> Schedule Meeting
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
