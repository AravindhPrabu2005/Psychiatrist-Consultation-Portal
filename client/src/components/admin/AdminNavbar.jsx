import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

export default function AdminNavbar() {
  const id = localStorage.getItem("id");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const res = await axiosInstance.get(`/admins/${id}`);
        setAdmin(res.data);
      } catch (err) {
        console.error('Failed to fetch admin:', err);
      }
    };

    fetchAdmin();
  }, [id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  function linkClass(path) {
    return `pb-1 ${location.pathname === path ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`;
  }

  return (
    <nav className="flex items-center justify-between px-8 py-4 border-b shadow-sm bg-white">
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="Psycare" className="h-10" />
      </div>
      <ul className="flex items-center space-x-10 text-[17px] font-medium">
        <Link to="/admin/home" className={linkClass('/admin/home')}>HOME</Link>
        <Link to="/admin/requests" className={linkClass('/admin/requests')}>REQUESTS</Link>
        <Link to="/admin/appointments" className={linkClass('/admin/appointments')}>APPOINTMENTS</Link>
      </ul>
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
          <img
            src={admin?.profilePhoto || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover"
          />
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg py-1">
            <Link to={`/admin/${id}`} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">
              <User size={16} /> Profile
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
