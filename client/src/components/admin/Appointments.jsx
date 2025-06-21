import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import axiosInstance from '../../axiosInstance';
import { Video, UserCircle2 } from 'lucide-react';

const Appointments = () => {
  const adminId = localStorage.getItem('id');
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/bookings/admin/${adminId}`).then(async res => {
      const paidBookings = res.data.filter(b => b.status === 'Approved' && b.paid === true);

      // Fetch user info for each booking
      const enriched = await Promise.all(
        paidBookings.map(async b => {
          const user = await axiosInstance.get(`/users/${b.userId}`).then(r => r.data).catch(() => null);
          return { ...b, user };
        })
      );

      setAppointments(enriched);
    });
  }, [adminId]);

  return (
    <>
      <AdminNavbar />
      <div className="pt-28 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Upcoming Paid Appointments</h2>

        {appointments.length === 0 ? (
          <p className="text-gray-500">No paid appointments available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {appointments.map((appt, idx) => (
              <div key={idx} className="bg-white border rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-4">
                  {appt.user?.profilePhoto ? (
                    <img src={appt.user.profilePhoto} alt="User" className="w-16 h-16 rounded-full object-cover border" />
                  ) : (
                    <UserCircle2 className="w-16 h-16 text-gray-400" />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{appt.user?.name || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500">{appt.user?.email}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-700 space-y-1">
                  <p><strong>Date:</strong> {appt.date}</p>
                  <p><strong>Time:</strong> {appt.time}</p>
                  <p><strong>Issue:</strong> {appt.issue}</p>
                </div>

                {appt.meetingLink && (
                  <a
                    href={appt.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center mt-4 bg-[#2ADA71] text-white px-4 py-2 rounded transition"
                  >
                    <Video className="inline-block mr-2" size={18} />Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Appointments;