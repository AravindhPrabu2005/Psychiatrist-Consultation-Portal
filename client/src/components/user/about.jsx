import React from 'react';
import UserNavbar from './UserNavbar';
import Footer from '../Footer';

export default function About() {
     return (
          <>
               <UserNavbar />
               <div className="min-h-screen bg-white pt-24 px-6 md:px-24 py-16">
                    <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 text-gray-800 tracking-wide">ABOUT US</h2>
                    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-14">
                         <div className="w-full md:w-1/2">
                              <img
                                   src="/about.avif"
                                   alt="About Us"
                                   className="rounded-md w-full h-[350px] object-cover object-center shadow-sm"
                              />
                         </div>
                         <div className="w-full md:w-1/2 text-gray-700 space-y-3 text-justify text-[14.5px] leading-[1.7]">
                              <p>
                                   Welcome to <span className="font-medium text-black">PsyCare</span>, your trusted partner in accessing mental health support with ease and privacy.
                                   At PsyCare, we recognize the importance of timely and compassionate care for your mental well-being.
                                   Our platform helps individuals connect with licensed psychiatrists and book appointments online without hassle.
                              </p>
                              <p>
                                   PsyCare is committed to revolutionizing online mental healthcare. We continually enhance our platform to improve user experience,
                                   ensure secure consultations, and deliver high-quality care from verified professionals.
                              </p>
                              <div>
                                   <p className="font-semibold text-[15px] text-black mb-1">Our Vision</p>
                                   <p>
                                        Our vision at PsyCare is to make mental healthcare accessible, affordable, and stigma-free for everyone.
                                        We aim to bridge the gap between individuals and mental health professionals through technology—helping you get the care you need, when you need it.
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
               <Footer />
          </>
     );
}
