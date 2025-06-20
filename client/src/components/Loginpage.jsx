import React, { useState } from 'react';
import axiosInstance from '../axiosInstance';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/login`, {
        email: formData.email,
        password: formData.password
      });

      if (response.data.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', response.data.user.isAdmin.toString());
        localStorage.setItem('id', response.data.user.id);

        if (response.data.user.isAdmin) {
          window.location.href = '/admin/home';
        } else {
          window.location.href = '/user/home';
        }
      } else {
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side Login Form */}
      <div className="md:w-1/2 flex items-center justify-center px-6 md:px-16 py-12 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <img src="/logo.png" alt="PsyCare" className="h-12 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-[#2A1D7C]">Login</h1>
            <p className="text-sm text-gray-500 mt-1">Access your PsyCare account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ADA71]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2ADA71]"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[#2ADA71] text-white py-2 rounded-lg font-semibold hover:brightness-110 transition"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600">
            Don’t have an account?{' '}
            <a href="/user/signup" className="text-[#2A1D7C] font-medium hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>

      {/* Right Side Visual */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#d7f5e9] to-[#e6f8f1] flex flex-col items-center justify-center p-10">
        <img
          src="/welcome.png"
          alt="Mental Health Illustration"
          className="max-w-[80%] md:max-w-[400px]"
        />
        <h2 className="text-3xl font-bold text-[#2A1D7C] mt-6 text-center">
          Welcome to PsyCare
        </h2>
        <p className="text-center text-gray-600 max-w-md mt-2">
          Mental wellness made easier. Login to manage appointments and access care.
        </p>
      </div>
    </div>
  );
}
