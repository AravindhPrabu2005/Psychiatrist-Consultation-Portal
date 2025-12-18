import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import axiosInstance from '../../axiosInstance';
import { UserCircle2, Calendar, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AppointmentHistory = () => {
  const adminId = localStorage.getItem('id');
  const navigate = useNavigate();
  const [pastAppointments, setPastAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPastAppointments();
  }, [adminId]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAppointments(pastAppointments);
    } else {
      const filtered = pastAppointments.filter(appt => 
        appt.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.issue?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredAppointments(filtered);
    }
  }, [searchTerm, pastAppointments]);

  const fetchPastAppointments = () => {
    setLoading(true);
    axiosInstance.get(`/bookings/admin/${adminId}`).then(async res => {
      const paidBookings = res.data.filter(b => b.status === 'Approved' && b.paid === true);

      // Filter only past appointments
      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const past = paidBookings.filter(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate < now;
      });

      // Fetch user info for each booking
      const enriched = await Promise.all(
        past.map(async b => {
          const userIdString = typeof b.userId === 'object' ? b.userId._id : b.userId;
          
          try {
            const user = await axiosInstance.get(`/users/${userIdString}`).then(r => r.data);
            return { ...b, user };
          } catch (error) {
            console.error('Error fetching user:', error);
            return { ...b, user: null };
          }
        })
      );

      const sorted = enriched.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPastAppointments(sorted);
      setFilteredAppointments(sorted);
      setLoading(false);
    }).catch(error => {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2ADA71] mb-4"></div>
            <p className="text-gray-500">Loading history...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="pt-28 px-4 max-w-6xl mx-auto pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/appointments')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <ArrowLeft size={20} />
              <span className="font-medium">Back to Appointments</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-gray-600" size={28} />
          <h2 className="text-3xl font-bold text-gray-800">Appointment History</h2>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium">
            {pastAppointments.length} total
          </span>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by patient name, email, or issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent outline-none"
            />
          </div>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No appointments found matching your search.' : 'No past appointments yet.'}
            </p>
            <button
              onClick={() => navigate('/admin/appointments')}
              className="mt-4 text-[#2ADA71] hover:underline"
            >
              ← Back to upcoming appointments
            </button>
          </div>
        ) : (
          <div className="bg-white border rounded-lg shadow-sm divide-y">
            {filteredAppointments.map((appt, idx) => (
              <div key={idx} className="p-5 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 items-start flex-1">
                    {appt.user?.profilePhoto ? (
                      <img
                        src={appt.user.profilePhoto}
                        alt={appt.user.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <UserCircle2 className="w-12 h-12 text-gray-400 flex-shrink-0" />
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-800 text-lg">
                          {appt.user?.name || 'Unknown User'}
                        </h4>
                      </div>

                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{appt.user?.email}</span>
                        {appt.user?.phone && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{appt.user.phone}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <span className="text-gray-500">📅</span>
                          <strong>{formatDate(appt.date)}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-gray-500">🕐</span>
                          <strong>{appt.time}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="text-gray-500">💰</span>
                          ₹{appt.amount}
                        </span>
                      </div>

                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3">
                        <span className="font-medium text-gray-600">Issue: </span>
                        {appt.issue}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                          Completed
                        </span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                          ✓ Paid
                        </span>
                        {appt.meetingLink && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                            📹 Meeting Conducted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AppointmentHistory;
