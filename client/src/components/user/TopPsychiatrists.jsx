import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TopPsychiatrists() {
  const [admins, setAdmins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axiosInstance.get('/admins');
        setAdmins(res.data.slice(0, 2));
      } catch (error) {
        console.error('Error fetching admins:', error);
      }
    };

    fetchAdmins();
  }, []);

  return (
    <div className="my-20 mx-6 sm:mx-10 md:mx-16 lg:mx-24">
      <div className="flex flex-col md:flex-row items-start justify-between gap-8">
        {/* Left Section */}
        <div className="md:w-1/2">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-snug">
            Thrive in your personal growth with India's top psychiatrists
          </h2>
          <p className="text-gray-600 mb-6">
            Find a specialist that's right for you. Browse from our trusted professionals and begin your wellness journey.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#2ADA71] text-white px-6 py-3 rounded-md font-medium hover:opacity-90"
          >
            Start Therapy
          </button>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {admins.map((admin) => (
            <div key={admin._id} className="bg-white shadow-lg rounded-xl p-5 w-[300px]">
              <img
                src={admin.profilePhoto}
                alt={admin.name}
                className="w-20 h-20 rounded-lg object-cover mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-800">{admin.name}</h3>

              <div className="mt-3 text-sm text-gray-600">
                {admin.gender && <p>Gender: {admin.gender}</p>}
                {admin.specialization && <p>Specialization: {admin.specialization}</p>}
              </div>

              <div className="flex items-center gap-2 bg-gray-100 text-sm text-gray-700 mt-4 px-3 py-2 rounded-md w-max">
                <Briefcase size={16} />
                {admin.experienceYears} years experience
              </div>

              <button
                onClick={() => navigate('/login')}
                className="text-sm text-[#2ADA71] mt-4 font-medium hover:underline"
              >
                Book an appointment →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
