import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BadgeCheck, Clock, Info, X } from 'lucide-react';
import axiosInstance from '../../axiosInstance';
import UserNavbar from './UserNavbar';
import Footer from '../Footer';

export default function BookAppointment() {
  const { id } = useParams();
  const [admin, setAdmin] = useState(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [issue, setIssue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axiosInstance
      .get(`/admins/${id}`)
      .then(res => setAdmin(res.data))
      .catch(() => setAdmin(null));
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
        fullDate: new Date(date), // exact date object
      });
    }
    return days;
  };

  const generateTimeSlots = (isToday) => {
    const slots = [];
    const now = new Date();
    for (let hour = 9; hour <= 20; hour++) {
      const slotTime = new Date();
      slotTime.setHours(hour, 0, 0, 0);
      if (!isToday || slotTime > now) {
        slots.push(slotTime.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }));
      }
    }
    return slots;
  };

  const next7Days = getNext7Days();
  const selectedDay = next7Days[selectedDateIndex];
  const isToday = selectedDateIndex === 0;
  const timeSlots = generateTimeSlots(isToday);

  const formattedDate = selectedDay.fullDate.toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleBookNow = () => {
    if (selectedTime) setIsModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!issue) return;
    setIsModalOpen(false);
    axiosInstance.post('/api/booking', {
      userId: localStorage.getItem('id'),
      adminId: id,
      date: formattedDate,
      time: selectedTime,
      issue
    })
      .then(() => {
        setIsModalOpen(false);
        alert('Booking requested successfully!');
        setIssue('');
        setSelectedTime(null);
      })
      .catch(() => {
        alert('Failed to request booking');
      });
    setIssue('');
    setSelectedTime(null);
  };

  if (!admin)
    return <div className="text-center mt-20 text-gray-500 text-xl">Loading...</div>;

  return (
    <>
      <UserNavbar />
      <div className="max-w-6xl mx-auto p-6 mt-10 pt-24 flex flex-col md:flex-row gap-8 relative z-10">
        {/* Image */}
        <div className="w-full md:w-1/3 flex justify-center items-start">
          <img
            src={admin.profilePhoto}
            alt={admin.name}
            className="w-64 h-[300px] object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Details */}
        <div className="w-full md:w-2/3">
          <div className="bg-blue-100 p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              Dr. {admin.name}
              <BadgeCheck size={20} className="text-blue-600" />
            </h2>
            <p className="text-gray-700 mt-1">{admin.specialization}</p>
            <span className="inline-block bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded mt-2">
              {admin.experienceYears} Years
            </span>
            <div className="mt-4 flex items-center gap-2 text-gray-700">
              <Info size={16} />
              <p>
                Dr. {admin.name} is committed to providing quality mental healthcare
                with compassion and empathy.
              </p>
            </div>
            <p className="mt-4 font-semibold text-gray-800">
              Appointment fee: <span className="text-black font-bold">₹500</span>
            </p>
          </div>

          {/* Dates */}
          <h3 className="text-lg font-semibold mb-3">Booking slots</h3>
          <div className="flex gap-3 mb-4 overflow-x-auto">
            {next7Days.map((slot, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedDateIndex(idx);
                  setSelectedTime(null);
                }}
                className={`w-14 h-20 rounded-lg flex flex-col items-center justify-center cursor-pointer font-semibold text-sm
                ${selectedDateIndex === idx ? 'bg-green-600 text-white' : 'bg-green-200 text-gray-800'}
              `}
              >
                <div>{slot.label}</div>
                <div>{slot.date}</div>
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="flex gap-4 flex-wrap mb-6">
            {timeSlots.length === 0 ? (
              <div className="text-sm text-gray-500 italic">No available slots</div>
            ) : (
              timeSlots.map((time, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTime(time)}
                  className={`flex items-center gap-1 border px-4 py-2 rounded-full text-sm cursor-pointer transition
                    ${selectedTime === time
                      ? 'bg-[#2ADA71] text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Clock size={16} />
                  {time}
                </div>
              ))
            )}
          </div>

          <button
            onClick={handleBookNow}
            className={`${selectedTime ? 'bg-[#2ADA71]' : 'bg-gray-400 cursor-not-allowed'
              } px-6 py-3 rounded-full text-white font-semibold text-sm transition`}
            disabled={!selectedTime}
          >
            Book Slot
          </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Confirm Booking</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">Selected Date</label>
              <div className="px-3 py-2 bg-gray-100 rounded text-sm">{formattedDate}</div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1 text-gray-700">Selected Time</label>
              <div className="px-3 py-2 bg-gray-100 rounded text-sm">{selectedTime}</div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Describe your issue</label>
              <textarea
                rows="3"
                className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-400"
                placeholder="e.g. Feeling anxious lately..."
                value={issue}
                onChange={e => setIssue(e.target.value)}
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={!issue}
                className={`px-4 py-2 rounded text-white text-sm font-medium ${issue ? 'bg-[#2ADA71] hover:scale-105' : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Request Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
