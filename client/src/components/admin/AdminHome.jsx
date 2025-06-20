import React from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../Footer';
import { CalendarDays, ClipboardList, Clock, Settings } from 'lucide-react';
import AdminNavbar from './AdminNavbar';

const AdminHome = () => {
  const navigate = useNavigate();

  return (
    <>
      <AdminNavbar />
      {/* Green-Themed Banner Section */}
      <div className='flex flex-col-reverse md:flex-row items-center bg-green-100 rounded-lg px-4 sm:px-6 md:px-10 lg:px-12 my-10 mx-4 md:mx-auto shadow-lg overflow-hidden max-w-6xl min-h-[400px]'>
        {/* Text Section */}
        <div className='flex-1 text-center md:text-left py-8 md:py-12'>
          <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-green-900 leading-tight'>
            <p>Welcome Back, Doctor</p>
            <p className='mt-2 text-green-700'>Manage Your Practice with Ease</p>
          </div>
          <p className='text-green-800 text-sm sm:text-base mt-4 max-w-md mx-auto md:mx-0'>
            Check appointments, manage availability, and connect with your patients seamlessly.
          </p>

          <div className='flex flex-wrap justify-center md:justify-start gap-4 mt-6'>
            <button
              onClick={() => navigate('/psy/appointments')}
              className='bg-green-600 text-white px-5 py-2 rounded-full hover:scale-105 transition text-sm font-semibold flex items-center gap-2'
            >
              <ClipboardList size={16} /> View Appointments
            </button>
            <button
              onClick={() => navigate('/psy/settings')}
              className='bg-white border border-green-600 text-green-600 px-5 py-2 rounded-full hover:bg-green-50 transition text-sm font-semibold flex items-center gap-2'
            >
              <Settings size={16} /> Availability Settings
            </button>
          </div>
        </div>

        {/* Image Section */}
        <div className='md:w-1/2 flex justify-center items-center mb-6 md:mb-0'>
          <img
            className='w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl max-h-[320px] object-contain'
            src="/adminbanner.webp"
            alt="Psychiatrist Dashboard"
          />
        </div>
      </div>

      {/* Stats Section */}
      <div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4 mb-10'>
        <div className='bg-white border rounded-lg shadow p-6 flex items-center gap-4'>
          <CalendarDays className='text-blue-500' size={36} />
          <div>
            <p className='text-gray-700 text-sm'>Appointments Today</p>
            <p className='text-2xl font-bold text-blue-800'>4</p>
          </div>
        </div>
        <div className='bg-white border rounded-lg shadow p-6 flex items-center gap-4'>
          <Clock className='text-green-500' size={36} />
          <div>
            <p className='text-gray-700 text-sm'>Next Slot</p>
            <p className='text-2xl font-bold text-green-700'>03:30 PM</p>
          </div>
        </div>
        <div className='bg-white border rounded-lg shadow p-6 flex items-center gap-4'>
          <ClipboardList className='text-purple-500' size={36} />
          <div>
            <p className='text-gray-700 text-sm'>Pending Requests</p>
            <p className='text-2xl font-bold text-purple-700'>2</p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default AdminHome;
