import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from './UserNavbar';
import Footer from '../Footer';
import PsychiatristSpecialities from './Specialities';
import TopPsychiatrists from './TopPsychiatrists';

const Userhome = () => {
     const navigate = useNavigate();

     return (
          <>
               <UserNavbar />
               <div className='flex flex-col-reverse md:flex-row items-center bg-[#2ADA71] rounded-lg px-4 sm:px-6 md:px-10 lg:px-12 my-10  pt-36 mx-4 md:mx-auto shadow-lg overflow-hidden max-w-6xl'>
                    <div className='flex-1 text-center md:text-left py-8 sm:py-10 md:py-12 lg:py-16'>
                         <div className='text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight'>
                              <p>Consult a Psychiatrist</p>
                              <p className='mt-2'>From the Comfort of Your Home</p>
                         </div>
                         <p className='text-white text-sm sm:text-base mt-4 max-w-md mx-auto md:mx-0'>
                              Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
                         </p>
                         <button
                              onClick={() => {
                                   navigate('/login');
                                   window.scrollTo(0, 0);
                              }}
                              className='bg-white text-sm sm:text-base text-[#2ADA71] px-6 py-2.5 rounded-full mt-5 hover:scale-105 transition-all font-semibold'
                         >
                              Book appointment →
                         </button>
                    </div>

                    <div className='md:w-1/2 lg:w-[340px] relative mb-4 md:mb-0'>
                         <img
                              className='w-full max-w-xs mx-auto'
                              src="/appointment_img.png"
                              alt="Doctors"
                         />
                    </div>
               </div>
               <PsychiatristSpecialities />
               <TopPsychiatrists />
               <Footer />
          </>
     );
};

export default Userhome;
