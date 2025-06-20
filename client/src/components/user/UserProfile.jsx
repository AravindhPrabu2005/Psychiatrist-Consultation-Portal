import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import UserNavbar from './UserNavbar';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const userId = localStorage.getItem('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${userId}`);
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  return (
    <>
      <UserNavbar />
      <div className="max-w-3xl mx-auto px-4 pt-28 py-10 text-gray-800">

        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
          <img
            src={user.profilePhoto}
            alt={user.name}
            className="w-36 h-36 object-cover rounded-lg shadow-md"
          />
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-extrabold mb-2">{user.name}</h1>
          </div>
        </div>

        <div className="mt-10 space-y-8">
          <section>
            <h2 className="text-base font-semibold uppercase underline mb-3">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Email id:</p>
                <p><a href={`mailto:${user.email}`} className="text-blue-600">{user.email}</a></p>
              </div>
              <div>
                <p className="font-semibold">Phone:</p>
                <p className="bg-gray-100 px-3 py-1 rounded-md">{user.phone}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="font-semibold">Address:</p>
                <p>{user.address}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-semibold uppercase underline mb-3">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Gender:</p>
                <select disabled className="bg-gray-100 px-3 py-1 rounded-md w-full">
                  <option>{user.gender}</option>
                </select>
              </div>
              <div>
                <p className="font-semibold">Birthday:</p>
                <input
                  type="date"
                  value={new Date(user.dob).toISOString().split('T')[0]}
                  disabled
                  className="bg-gray-100 px-3 py-1 rounded-md w-full"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
