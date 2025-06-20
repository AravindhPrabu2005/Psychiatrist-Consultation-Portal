import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { User2, BadgeInfo, Briefcase, Search } from 'lucide-react';
import UserNavbar from './UserNavbar';

export default function AllPsychiatrists() {
     const [admins, setAdmins] = useState([]);
     const [filtered, setFiltered] = useState([]);
     const [nameSearch, setNameSearch] = useState('');
     const [specializationSearch, setSpecializationSearch] = useState('');
     const navigate = useNavigate();

     useEffect(() => {
          const fetchAdmins = async () => {
               try {
                    const res = await axiosInstance.get('/admins');
                    setAdmins(res.data);
                    setFiltered(res.data);
               } catch (err) {
                    console.error('Error fetching admins:', err);
               }
          };
          fetchAdmins();
     }, []);

     useEffect(() => {
          const filteredData = admins.filter((admin) =>
               admin.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
               admin.specialization?.toLowerCase().includes(specializationSearch.toLowerCase())
          );
          setFiltered(filteredData);
     }, [nameSearch, specializationSearch, admins]);

     return (
          <>
          <UserNavbar />
               <div className="px-6 sm:px-10 md:px-16 lg:px-24 py-10 pt-24 bg-gray-50 min-h-screen">

                    <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
                         <div className="relative w-full sm:w-1/3">
                              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                              <input
                                   type="text"
                                   placeholder="Search by name"
                                   value={nameSearch}
                                   onChange={(e) => setNameSearch(e.target.value)}
                                   className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A1D7C] shadow-sm"
                              />
                         </div>

                         <div className="relative w-full sm:w-1/3">
                              <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                              <input
                                   type="text"
                                   placeholder="Search by specialization"
                                   value={specializationSearch}
                                   onChange={(e) => setSpecializationSearch(e.target.value)}
                                   className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A1D7C] shadow-sm"
                              />
                         </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                         {filtered.map((admin) => (
                              <div
                                   key={admin._id}
                                   className="bg-white rounded-md overflow-hidden border shadow-md hover:shadow-xl transition-all transform hover:scale-[1.015] duration-300 flex flex-col h-[400px]"
                              >
                                   <img
                                        src={admin.profilePhoto}
                                        alt={admin.name}
                                        className="h-44 w-full object-cover"
                                   />
                                   <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-2">
                                             <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
                                                  <User2 className="h-5 w-5 text-[#2A1D7C]" />
                                                  {admin.name}
                                             </div>
                                             <div className="flex items-center gap-2 text-sm text-gray-600">
                                                  <BadgeInfo className="h-4 w-4 text-[#2A1D7C]" />
                                                  {admin.specialization || 'N/A'}
                                             </div>
                                             <div className="flex items-center gap-2 text-sm text-gray-600">
                                                  <Briefcase className="h-4 w-4 text-[#2A1D7C]" />
                                                  {admin.experienceYears
                                                       ? `${admin.experienceYears} years experience`
                                                       : 'Experience info not available'}
                                             </div>
                                        </div>
                                        <button
                                             onClick={() => navigate(`/user/book/${admin._id}`)}
                                             className="mt-5 bg-[#2ADA71] text-white font-medium px-4 py-2 rounded-md hover:bg-[#25bd65] transition"
                                        >
                                             Get Appointment
                                        </button>
                                   </div>
                              </div>
                         ))}
                    </div>

                    {filtered.length === 0 && (
                         <p className="text-center text-gray-500 mt-10 text-lg">No psychiatrists found.</p>
                    )}
               </div>
          </>
     );
}
