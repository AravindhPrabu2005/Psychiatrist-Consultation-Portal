import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

export default function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    gender: '',
    age: '',
    dob: '',
    phone: '',
    address: '',
    profilePhoto: null
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePhoto') {
      setFormData({ ...formData, profilePhoto: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    for (const key in formData) {
      data.append(key, formData[key]);
    }

    try {
      const response = await axiosInstance.post('/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(response.data.message);
      navigate('/login');
    } catch (error) {
      console.error('Error registering user:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left: Form Section */}
      <div className="md:w-1/2 flex items-center justify-center bg-white px-6 py-10 md:px-16">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src="/logo.png" alt="PsyCare" className="h-10 mx-auto mb-2" />
            <h2 className="text-3xl font-bold text-[#2ADA71]">Create Account</h2>
            <p className="text-sm text-gray-600">Join PsyCare for your well-being journey</p>
          </div>

          <form onSubmit={handleSubmit} encType="multipart/form-data" className="grid grid-cols-1 gap-4">
            <input
              type="file"
              name="profilePhoto"
              accept="image/*"
              onChange={handleChange}
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md text-gray-700 focus:outline-[#2ADA71]"
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="border px-3 py-2 rounded-md focus:outline-[#2ADA71]"
            />

            <button
              type="submit"
              className="bg-[#2ADA71] text-white py-2 rounded-md font-semibold hover:brightness-110 transition"
            >
              Sign Up
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/login" className="text-[#2A1D7C] font-medium hover:underline">Login</a>
          </p>
        </div>
      </div>

      {/* Right: Visual/Brand Section */}
      <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-[#d7f5e9] to-[#e6f8f1] p-10">
        <div className="text-center space-y-4">
          <img src="/welcome.png" alt="Welcome" className="max-w-[80%] md:max-w-sm mx-auto" />
          <h3 className="text-2xl font-bold text-[#2A1D7C]">Welcome to PsyCare</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Sign up and take your first step toward better mental health and emotional well-being.
          </p>
        </div>
      </div>
    </div>
  );
}
