import React, { useEffect, useState } from 'react';
import AdminNavbar from './AdminNavbar';
import axiosInstance from '../../axiosInstance';
import { 
  Video, 
  UserCircle2, 
  Link as LinkIcon, 
  X, 
  History, 
  Calendar,
  Clock,
  Phone,
  Mail,
  AlertCircle,
  Check,
  Copy,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const adminId = localStorage.getItem('id');
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState('');
  const [applyToAll, setApplyToAll] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppointments();
  }, [adminId]);

  const fetchAppointments = () => {
    axiosInstance.get(`/bookings/admin/${adminId}`).then(async res => {
      const paidBookings = res.data.filter(b => b.status === 'Approved' && b.paid === true);

      const now = new Date();
      now.setHours(0, 0, 0, 0);

      const upcoming = paidBookings.filter(b => {
        const bookingDate = new Date(b.date);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate >= now;
      });

      const enriched = await Promise.all(
        upcoming.map(async b => {
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

      enriched.sort((a, b) => new Date(a.date) - new Date(b.date));
      setUpcomingAppointments(enriched);
    }).catch(error => {
      console.error('Error fetching appointments:', error);
    });
  };

  const openLinkModal = (appt = null) => {
    if (appt) {
      setSelectedAppointment(appt);
      setMeetingLink(appt.meetingLink || '');
      setApplyToAll(false);
    } else {
      setSelectedAppointment(null);
      setMeetingLink('');
      setApplyToAll(true);
    }
    setShowModal(true);
  };

  const saveMeetingLink = async () => {
    if (!meetingLink.trim()) {
      alert('Please enter a valid meeting link');
      return;
    }

    setSaving(true);

    try {
      if (applyToAll) {
        const appointmentsToUpdate = upcomingAppointments.filter(appt => !appt.meetingLink);
        
        if (appointmentsToUpdate.length === 0) {
          alert('All appointments already have meeting links!');
          setSaving(false);
          return;
        }

        await Promise.all(
          appointmentsToUpdate.map(appt =>
            axiosInstance.patch(`/bookings/${appt._id}/meeting-link`, {
              meetingLink: meetingLink.trim()
            })
          )
        );

        alert(`Meeting link added to ${appointmentsToUpdate.length} appointment(s)!`);
      } else {
        await axiosInstance.patch(`/bookings/${selectedAppointment._id}/meeting-link`, {
          meetingLink: meetingLink.trim()
        });

        alert('Meeting link updated successfully!');
      }

      setShowModal(false);
      setMeetingLink('');
      fetchAppointments();
    } catch (error) {
      console.error('Error saving meeting link:', error);
      alert('Failed to save meeting link. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (link, apptId) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(apptId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const getFilteredAppointments = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    switch (filter) {
      case 'today':
        return upcomingAppointments.filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate.toDateString() === today.toDateString();
        });
      case 'week':
        return upcomingAppointments.filter(appt => {
          const apptDate = new Date(appt.date);
          return apptDate >= today && apptDate <= weekFromNow;
        });
      default:
        return upcomingAppointments;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const appointmentsWithoutLinks = upcomingAppointments.filter(appt => !appt.meetingLink).length;
  const filteredAppointments = getFilteredAppointments();

  return (
    <>
      <AdminNavbar />
      <div className="pt-28 px-4 max-w-7xl mx-auto pb-10">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Upcoming Appointments</h2>
              <p className="text-gray-600">Manage your scheduled consultations</p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/admin/history')}
                className="bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition"
              >
                <History size={20} />
                History
              </button>

              {appointmentsWithoutLinks > 0 && (
                <button
                  onClick={() => openLinkModal()}
                  className="bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition shadow-lg shadow-green-200"
                >
                  <LinkIcon size={20} />
                  Add Link to All ({appointmentsWithoutLinks})
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-xs font-medium mb-1">Total Upcoming</p>
                  <p className="text-2xl font-bold text-blue-700">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="text-blue-500" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-xs font-medium mb-1">With Link</p>
                  <p className="text-2xl font-bold text-green-700">
                    {upcomingAppointments.filter(a => a.meetingLink).length}
                  </p>
                </div>
                <Check className="text-green-500" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-xs font-medium mb-1">Pending</p>
                  <p className="text-2xl font-bold text-orange-700">{appointmentsWithoutLinks}</p>
                </div>
                <AlertCircle className="text-orange-500" size={32} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-xs font-medium mb-1">Today</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {upcomingAppointments.filter(a => isToday(a.date)).length}
                  </p>
                </div>
                <Clock className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'all'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('today')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'today'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setFilter('week')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === 'week'
                  ? 'bg-white text-gray-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              This Week
            </button>
          </div>
        </div>

        {/* Appointments Grid */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
            <Calendar className="mx-auto text-gray-400 mb-4" size={64} />
            <p className="text-gray-500 text-lg font-medium mb-2">No appointments found</p>
            <p className="text-gray-400 text-sm mb-4">
              {filter !== 'all' 
                ? 'Try changing the filter to see more appointments' 
                : 'You have no upcoming paid appointments'}
            </p>
            <button
              onClick={() => navigate('/admin/history')}
              className="text-[#2ADA71] hover:underline font-medium"
            >
              View past appointments →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAppointments.map((appt, idx) => (
              <div 
                key={idx} 
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border-2 ${
                  isToday(appt.date) ? 'border-[#2ADA71] ring-2 ring-green-100' : 'border-gray-100'
                }`}
              >
                {/* Header */}
                <div className={`p-3 ${isToday(appt.date) ? 'bg-gradient-to-r from-green-50 to-emerald-50' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${isToday(appt.date) ? 'bg-[#2ADA71]' : 'bg-blue-500'}`}>
                        <Calendar className="text-white" size={16} />
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${isToday(appt.date) ? 'text-[#2ADA71]' : 'text-gray-800'}`}>
                          {formatDate(appt.date)}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Clock size={12} />
                          {appt.time}
                        </p>
                      </div>
                    </div>
                    {isToday(appt.date) && (
                      <span className="px-2 py-1 bg-[#2ADA71] text-white text-xs font-bold rounded-full">
                        TODAY
                      </span>
                    )}
                  </div>
                </div>

                {/* Patient Info */}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {appt.user?.profilePhoto ? (
                      <img 
                        src={appt.user.profilePhoto} 
                        alt="User" 
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow">
                        <UserCircle2 className="text-white" size={24} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 mb-1 truncate">
                        {appt.user?.name || 'Unknown User'}
                      </h3>
                      <div className="space-y-0.5">
                        <p className="text-xs text-gray-600 flex items-center gap-1 truncate">
                          <Mail size={12} className="text-gray-400 flex-shrink-0" />
                          {appt.user?.email}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1">
                          <Phone size={12} className="text-gray-400 flex-shrink-0" />
                          {appt.user?.phone || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Issue */}
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-600 mb-1">Patient Concern</p>
                    <p className="text-gray-700 text-xs leading-relaxed line-clamp-2">{appt.issue}</p>
                  </div>

                  {/* Action Buttons */}
                  {appt.meetingLink ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <a
                          href={appt.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 text-center bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white px-3 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 shadow-md shadow-green-200 text-sm"
                        >
                          <Video size={16} />
                          Join
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => copyToClipboard(appt.meetingLink, appt._id)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
                          title="Copy link"
                        >
                          {copiedLink === appt._id ? (
                            <Check size={16} className="text-green-600" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      <button
                        onClick={() => openLinkModal(appt)}
                        className="w-full text-center text-xs text-gray-600 hover:text-[#2ADA71] transition font-medium"
                      >
                        Update Link
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openLinkModal(appt)}
                      className="w-full text-center bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 px-3 py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2 border-2 border-orange-200 text-sm"
                    >
                      <LinkIcon size={16} />
                      Add Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#2ADA71] to-[#25c063] p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <LinkIcon className="text-white" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    {applyToAll ? 'Add Meeting Link to All' : 'Update Meeting Link'}
                  </h2>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white/80 hover:text-white transition p-1 hover:bg-white/20 rounded-lg"
                  disabled={saving}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {applyToAll ? (
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">Bulk Action</p>
                      <p className="text-sm text-blue-700">
                        This link will be added to <strong>{appointmentsWithoutLinks} appointments</strong> that don't have a meeting link yet.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-2">
                    {selectedAppointment?.user?.profilePhoto ? (
                      <img
                        src={selectedAppointment.user.profilePhoto}
                        alt="User"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                      />
                    ) : (
                      <UserCircle2 size={48} className="text-purple-400" />
                    )}
                    <div>
                      <p className="font-semibold text-gray-800">
                        {selectedAppointment?.user?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAppointment?.date} at {selectedAppointment?.time}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-gray-700">
                  Meeting Link
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2ADA71] focus:border-[#2ADA71] outline-none transition"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <AlertCircle size={12} />
                  Supported: Google Meet, Zoom, Microsoft Teams, or any video platform
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-semibold transition"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveMeetingLink}
                  disabled={!meetingLink.trim() || saving}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${
                    meetingLink.trim() && !saving
                      ? 'bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white shadow-lg shadow-green-200'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={20} />
                      {applyToAll ? 'Apply to All' : 'Save Link'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Appointments;
