import React from 'react';
import UserNavbar from './UserNavbar';
import Footer from '../Footer';

const ContactUs = () => {
     return (
          <>
               <UserNavbar />
               <div className="max-w-6xl mx-auto py-16 px-4 pt-28 lg:flex lg:items-center lg:justify-between">
                    {/* Left Image */}
                    <div className="lg:w-1/2 mb-10 lg:mb-0">
                         <img
                              src="/contact.jpg"
                              alt="Doctor treating child"
                              className="rounded-lg shadow-md"
                         />
                    </div>

                    {/* Right Content */}
                    <div className="lg:w-1/2 px-6">
                         <h2 className="text-3xl font-semibold text-gray-800 mb-6">CONTACT US</h2>

                         <div className="mb-8">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">OUR OFFICE</h3>
                              <p className="text-gray-500">
                                   00000 Muzaffarnagar<br />
                                   00000, U.P, (IND)
                              </p>
                              <p className="text-gray-500 mt-3">
                                   Tel: (+91) 123-4567890<br />
                                   Email: psycare@gmail.com
                              </p>
                         </div>

                         <div className="mb-6">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">CAREERS AT PsyCare</h3>
                              <p className="text-gray-500 mb-4">
                                   Learn more about our teams and job openings.
                              </p>
                              <button className="bg-white border border-black px-6 py-2 rounded-md hover:bg-gray-100 transition">
                                   Explore Jobs
                              </button>
                         </div>
                    </div>
               </div>
               <Footer />
          </>
     );
};

export default ContactUs;
