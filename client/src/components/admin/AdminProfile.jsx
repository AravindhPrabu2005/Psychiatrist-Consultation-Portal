import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import AdminNavbar from './AdminNavbar';

export default function AdminProfile() {
  const [admin, setAdmin] = useState(null);
  const adminId = localStorage.getItem('id');

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axiosInstance.get(`/admins/${adminId}`);
        setAdmin(res.data);
      } catch (err) {
        console.error('Error fetching admin:', err);
      }
    };

    fetchAdmin();
  }, [adminId]);

  if (!admin) return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  return (
    <>
      <AdminNavbar />
      <div className="max-w-3xl mx-auto px-4 py-10 text-gray-800">

        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <img
            src={admin.profilePhoto}
            alt={admin.name}
            className="w-36 h-36 object-cover rounded-lg shadow-md"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold mb-2">{admin.name}</h1>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-base font-semibold uppercase underline mb-3">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Email id:</p>
                <p><a href={`mailto:${admin.email}`} className="text-blue-600">{admin.email}</a></p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold uppercase underline mb-3">Additional Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Gender:</p>
                <p className="bg-gray-100 px-3 py-1 rounded-md">{admin.gender}</p>
              </div>
              <div>
                <p className="font-semibold">Experience:</p>
                <p className="bg-gray-100 px-3 py-1 rounded-md">{admin.experienceYears} years</p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-semibold">Specialization:</p>
                <p className="bg-gray-100 px-3 py-1 rounded-md">{admin.specialization}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
