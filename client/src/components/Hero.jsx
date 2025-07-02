import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      <header className="w-full px-4 sm:px-6 py-4 flex flex-wrap justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PsyCare Logo" className="h-10 w-auto" />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3 mt-2 sm:mt-0">
          <button
            onClick={() => navigate('/login')}
            className="text-[#2A1D7C] text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 hover:bg-gray-100 rounded transition inline-flex items-center justify-center"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/user/signup')}
            className="bg-[#2ADA71] text-white text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-green-600 transition inline-flex items-center justify-center"
          >
            Sign in as Recipient
          </button>
          <button
            onClick={() => navigate('/admin/signup')}
            className="border border-[#2ADA71] text-[#2ADA71] text-sm sm:text-base px-3 py-1.5 sm:px-4 sm:py-2 rounded hover:bg-green-50 transition inline-flex items-center justify-center"
          >
            Sign in as Therapist
          </button>
        </div>
      </header>

      <main className="flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 md:px-12 lg:px-24 py-12 lg:py-24">
        <div className="w-full lg:w-1/2 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#2A1D7C] leading-tight">
            Welcome to <span className="text-[#2ADA71]">PsyCare</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600">
            Confidential, compassionate mental health care — anytime, anywhere.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#2ADA71] text-white text-sm sm:text-base px-4 py-2 rounded-lg hover:scale-105 transition inline-flex items-center justify-center"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/user/signup')}
              className="bg-white text-[#2A1D7C] border border-[#2A1D7C] text-sm sm:text-base px-4 py-2 rounded-lg hover:bg-gray-50 transition inline-flex items-center justify-center"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
          <img
            src="/welcome.png"
            alt="Mental wellness illustration"
            className="w-full max-w-md h-auto"
          />
        </div>
      </main>
    </div>
  );
}
