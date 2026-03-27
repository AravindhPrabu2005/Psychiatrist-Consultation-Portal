import React, { useEffect, useState, useCallback, useRef } from 'react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  User2, BadgeInfo, Briefcase, Search, Filter,
  Star, Calendar, Clock, Award, X
} from 'lucide-react';
import UserNavbar from './UserNavbar';
import Footer from '../Footer';

export default function AllPsychiatrists() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [nameSearch, setNameSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [specializationSearch, setSpecializationSearch] = useState('');
  const [specializationInputValue, setSpecializationInputValue] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [doctorStats, setDoctorStats] = useState({});
  const debounceTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axiosInstance.get('/admins');
        setAdmins(res.data);
        setFiltered(res.data);

        const statsPromises = res.data.map(admin =>
          axiosInstance.get(`/api/reviews/stats/${admin._id}`)
            .then(statsRes => ({ id: admin._id, stats: statsRes.data }))
            .catch(() => ({ id: admin._id, stats: null }))
        );

        const allStats = await Promise.all(statsPromises);
        const statsMap = {};
        allStats.forEach(({ id, stats }) => { statsMap[id] = stats; });
        setDoctorStats(statsMap);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admins:', err);
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  const applyFilters = useCallback(() => {
    setSearching(true);
    let filteredData = admins.filter((admin) =>
      admin.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
      admin.specialization?.toLowerCase().includes(specializationSearch.toLowerCase())
    );

    if (selectedSpecialization !== 'all') {
      filteredData = filteredData.filter(
        admin => admin.specialization?.toLowerCase() === selectedSpecialization.toLowerCase()
      );
    }

    if (sortBy === 'name') {
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'experience') {
      filteredData.sort((a, b) => (b.experienceYears || 0) - (a.experienceYears || 0));
    } else if (sortBy === 'rating') {
      filteredData.sort((a, b) => {
        const ratingA = doctorStats[a._id]?.averageRating || 0;
        const ratingB = doctorStats[b._id]?.averageRating || 0;
        return ratingB - ratingA;
      });
    }

    setFiltered(filteredData);
    setSearching(false);
  }, [nameSearch, specializationSearch, selectedSpecialization, sortBy, admins, doctorStats]);

  const debouncedFilter = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    setSearching(true);
    debounceTimerRef.current = setTimeout(() => { applyFilters(); }, 300);
  }, [applyFilters]);

  useEffect(() => { if (!loading) debouncedFilter(); }, [nameSearch, specializationSearch, loading, debouncedFilter]);
  useEffect(() => { if (!loading) applyFilters(); }, [selectedSpecialization, sortBy, loading, applyFilters]);
  useEffect(() => () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); }, []);

  const handleNameSearchChange = (e) => { setInputValue(e.target.value); setNameSearch(e.target.value); };
  const handleSpecializationSearchChange = (e) => { setSpecializationInputValue(e.target.value); setSpecializationSearch(e.target.value); };

  const specializations = [...new Set(admins.map(a => a.specialization).filter(Boolean))];

  const clearFilters = () => {
    setInputValue(''); setNameSearch('');
    setSpecializationInputValue(''); setSpecializationSearch('');
    setSelectedSpecialization('all'); setSortBy('name');
  };

  if (loading) return (
    <>
      <UserNavbar />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-[#2ADA71] mb-3"></div>
          <p className="text-gray-600">Loading doctors...</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      <UserNavbar />
      <div className="min-h-screen pt-24 pb-10">

        {/* Search and Filter Section */}
        <div className="max-w-6xl mx-auto px-4 mb-5">
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">

            {/* Search Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                {searching && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2ADA71]"></div>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={inputValue}
                  onChange={handleNameSearchChange}
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent transition text-sm"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search by specialization..."
                  value={specializationInputValue}
                  onChange={handleSpecializationSearchChange}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent transition text-sm"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="text-gray-500" size={15} />
                <span className="text-xs font-medium text-gray-600">Filter:</span>
              </div>

              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent text-xs bg-white"
              >
                <option value="all">All Specializations</option>
                {specializations.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent text-xs bg-white"
              >
                <option value="name">Sort: Name</option>
                <option value="experience">Sort: Experience</option>
                <option value="rating">Sort: Rating</option>
              </select>

              {(nameSearch || specializationSearch || selectedSpecialization !== 'all' || sortBy !== 'name') && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-1.5 text-xs font-medium"
                >
                  <X size={13} /> Clear
                </button>
              )}

              <div className="ml-auto">
                <span className="text-xs text-gray-500">
                  <strong className="text-gray-700">{filtered.length}</strong> of <strong className="text-gray-700">{admins.length}</strong> doctors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="max-w-6xl mx-auto px-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white rounded-2xl shadow-md p-10 max-w-sm mx-auto">
                <User2 className="mx-auto text-gray-300 mb-3" size={48} />
                <h3 className="text-lg font-bold text-gray-800 mb-1">No Doctors Found</h3>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="bg-[#2ADA71] text-white px-5 py-2 rounded-lg hover:bg-[#25c063] transition font-medium text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            // ✅ Key change: 2 cols on small laptop, 3 on large, 4 on xl
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {filtered.map((admin) => {
                const stats = doctorStats[admin._id];
                const hasRating = stats && stats.totalReviews > 0;

                return (
                  <div
                    key={admin._id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] duration-300 border border-gray-200 flex flex-col"
                  >
                    {/* Doctor Image */}
                    <div className="relative w-full h-36 overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
                      <img
                        src={admin.profilePhoto}
                        alt={admin.name}
                        className="w-full h-full object-contain"
                      />
                      {hasRating ? (
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                          <Star className="text-yellow-500 fill-yellow-500" size={11} />
                          <span className="text-xs font-semibold text-gray-800">{stats.averageRating}</span>
                          <span className="text-xs text-gray-500">({stats.totalReviews})</span>
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full shadow-md">
                          <span className="text-xs font-medium text-gray-500">New</span>
                        </div>
                      )}
                    </div>


                    {/* Doctor Info */}
                    <div className="p-3 flex-1 flex flex-col">
                      {/* Name */}
                      <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-1 truncate">
                        Dr. {admin.name}
                        <Award className="text-[#2ADA71] flex-shrink-0" size={13} />
                      </h3>

                      {/* Details */}
                      <div className="space-y-1.5 mb-2 flex-1">
                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <div className="p-0.5 bg-purple-100 rounded flex-shrink-0">
                            <BadgeInfo className="text-purple-600" size={11} />
                          </div>
                          <span className="font-medium truncate">{admin.specialization || 'Psychiatry'}</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <div className="p-0.5 bg-blue-100 rounded flex-shrink-0">
                            <Briefcase className="text-blue-600" size={11} />
                          </div>
                          <span className="truncate">
                            {admin.experienceYears ? `${admin.experienceYears} yrs exp` : 'Experienced'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                          <div className="p-0.5 bg-green-100 rounded flex-shrink-0">
                            <Clock className="text-green-600" size={11} />
                          </div>
                          <span>Available</span>
                        </div>

                        {hasRating && (
                          <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                            <div className="p-0.5 bg-yellow-100 rounded flex-shrink-0">
                              <Star className="text-yellow-600" size={11} />
                            </div>
                            <span>{stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}</span>
                          </div>
                        )}
                      </div>

                      {/* Fee */}
                      <div className="bg-green-50 px-2 py-1.5 rounded-lg border border-green-200 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Fee</span>
                          <span className="text-sm font-bold text-green-600">₹500</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={() => navigate(`/user/book/${admin._id}`)}
                        className="w-full bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white font-semibold px-3 py-2 rounded-lg transition-all shadow-sm flex items-center justify-center gap-1.5 text-xs"
                      >
                        <Calendar size={13} />
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
