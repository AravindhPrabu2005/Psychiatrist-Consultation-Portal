import React, { useEffect, useState } from 'react';
import axiosInstance from '../../axiosInstance';
import { useNavigate } from 'react-router-dom';
import { 
  User2, 
  BadgeInfo, 
  Briefcase, 
  Search, 
  Filter,
  Star,
  Calendar,
  Clock,
  Award,
  X
} from 'lucide-react';
import UserNavbar from './UserNavbar';
import Footer from '../Footer';

export default function AllPsychiatrists() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [nameSearch, setNameSearch] = useState('');
  const [specializationSearch, setSpecializationSearch] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [doctorStats, setDoctorStats] = useState({}); // Store ratings
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axiosInstance.get('/admins');
        setAdmins(res.data);
        setFiltered(res.data);
        
        // Fetch ratings for all doctors
        const statsPromises = res.data.map(admin => 
          axiosInstance.get(`/api/reviews/stats/${admin._id}`)
            .then(statsRes => ({ id: admin._id, stats: statsRes.data }))
            .catch(() => ({ id: admin._id, stats: null }))
        );
        
        const allStats = await Promise.all(statsPromises);
        const statsMap = {};
        allStats.forEach(({ id, stats }) => {
          statsMap[id] = stats;
        });
        
        setDoctorStats(statsMap);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching admins:', err);
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  useEffect(() => {
    let filteredData = admins.filter((admin) =>
      admin.name.toLowerCase().includes(nameSearch.toLowerCase()) &&
      admin.specialization?.toLowerCase().includes(specializationSearch.toLowerCase())
    );

    // Filter by selected specialization
    if (selectedSpecialization !== 'all') {
      filteredData = filteredData.filter(
        admin => admin.specialization?.toLowerCase() === selectedSpecialization.toLowerCase()
      );
    }

    // Sort
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
  }, [nameSearch, specializationSearch, selectedSpecialization, sortBy, admins, doctorStats]);

  // Get unique specializations
  const specializations = [...new Set(admins.map(a => a.specialization).filter(Boolean))];

  const clearFilters = () => {
    setNameSearch('');
    setSpecializationSearch('');
    setSelectedSpecialization('all');
    setSortBy('name');
  };

  if (loading) {
    return (
      <>
        <UserNavbar />
        <div className="min-h-screen flex items-center justify-center from-blue-50 via-purple-50 to-pink-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-[#2ADA71] mb-4"></div>
            <p className="text-gray-600 text-lg">Loading doctors...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <UserNavbar />
      <div className="min-h-screen from-blue-50 via-purple-50 to-pink-50 pt-28">

        {/* Search and Filter Section */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            {/* Search Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent transition"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by specialization..."
                  value={specializationSearch}
                  onChange={(e) => setSpecializationSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="text-gray-600" size={20} />
                <span className="text-sm font-medium text-gray-700">Filter by:</span>
              </div>

              {/* Specialization Filter */}
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent text-sm"
              >
                <option value="all">All Specializations</option>
                {specializations.map((spec, idx) => (
                  <option key={idx} value={spec}>{spec}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2ADA71] focus:border-transparent text-sm"
              >
                <option value="name">Sort by Name</option>
                <option value="experience">Sort by Experience</option>
                <option value="rating">Sort by Rating</option>
              </select>

              {/* Clear Filters */}
              {(nameSearch || specializationSearch || selectedSpecialization !== 'all' || sortBy !== 'name') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center gap-2 text-sm font-medium"
                >
                  <X size={16} />
                  Clear Filters
                </button>
              )}

              {/* Results Count */}
              <div className="ml-auto">
                <span className="text-sm text-gray-600">
                  Showing <strong className="text-gray-800">{filtered.length}</strong> of <strong className="text-gray-800">{admins.length}</strong> doctors
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-12">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto">
                <User2 className="mx-auto text-gray-400 mb-4" size={64} />
                <h3 className="text-xl font-bold text-gray-800 mb-2">No Doctors Found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="bg-[#2ADA71] text-white px-6 py-3 rounded-lg hover:bg-[#25c063] transition font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((admin) => {
                const stats = doctorStats[admin._id];
                const hasRating = stats && stats.totalReviews > 0;
                
                return (
                  <div
                    key={admin._id}
                    className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all transform hover:scale-[1.03] duration-300 border border-gray-200 flex flex-col"
                  >
                    {/* Doctor Image */}
                    <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-purple-100 to-blue-100">
                      <img
                        src={admin.profilePhoto}
                        alt={admin.name}
                        className="w-full h-full object-contain"
                      />
                      {hasRating ? (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                          <Star className="text-yellow-500 fill-yellow-500" size={14} />
                          <span className="text-xs font-semibold text-gray-800">
                            {stats.averageRating}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({stats.totalReviews})
                          </span>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-lg">
                          <span className="text-xs font-medium text-gray-600">New</span>
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Name */}
                      <h3 className="text-base font-bold text-gray-800 mb-2 flex items-center gap-1">
                        Dr. {admin.name}
                        <Award className="text-[#2ADA71] flex-shrink-0" size={14} />
                      </h3>

                      {/* Details */}
                      <div className="space-y-2 mb-3 flex-1">
                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <div className="p-1 bg-purple-100 rounded">
                            <BadgeInfo className="text-purple-600" size={12} />
                          </div>
                          <span className="font-medium truncate">{admin.specialization || 'Psychiatry'}</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <div className="p-1 bg-blue-100 rounded">
                            <Briefcase className="text-blue-600" size={12} />
                          </div>
                          <span className="truncate">
                            {admin.experienceYears ? `${admin.experienceYears} years` : 'Experienced'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600 text-xs">
                          <div className="p-1 bg-green-100 rounded">
                            <Clock className="text-green-600" size={12} />
                          </div>
                          <span>Available</span>
                        </div>

                        {/* Show review count if exists */}
                        {hasRating && (
                          <div className="flex items-center gap-2 text-gray-600 text-xs">
                            <div className="p-1 bg-yellow-100 rounded">
                              <Star className="text-yellow-600" size={12} />
                            </div>
                            <span>{stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}</span>
                          </div>
                        )}
                      </div>

                      {/* Consultation Fee */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-lg border border-green-200 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Fee</span>
                          <span className="text-base font-bold text-green-600">₹500</span>
                        </div>
                      </div>

                      {/* Book Button */}
                      <button
                        onClick={() => navigate(`/user/book/${admin._id}`)}
                        className="w-full bg-gradient-to-r from-[#2ADA71] to-[#25c063] hover:from-[#25c063] hover:to-[#2ADA71] text-white font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-green-200 flex items-center justify-center gap-2 text-sm"
                      >
                        <Calendar size={16} />
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
