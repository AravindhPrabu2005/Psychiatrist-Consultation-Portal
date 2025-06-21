import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';
import { User, LogOut } from 'lucide-react';


export default function UserNavbar() {
  const id = localStorage.getItem("id");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get(`/users/${id}`);
        setUser(res.data);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };

    fetchUser();
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

  function handlelogout() {
    localStorage.clear();
    navigate('/');
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 border-b shadow-sm bg-white">
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="PsyCare" className="h-8" />
      </div>
      <ul className="flex items-center space-x-10 text-[17px] font-medium">
        <Link
          to="/user/home"
          className={`pb-1 ${location.pathname === '/user/home' ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`}
        >
          HOME
        </Link>
        <Link
          to="/user/doctors"
          className={`pb-1 ${location.pathname === '/user/doctors' ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`}
        >
          ALL DOCTORS
        </Link>
        <Link
          to="/user/approved"
          className={`pb-1 ${location.pathname === '/user/approved' ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`}
        >
          APPOINTMENTS
        </Link>
        <Link
          to="/user/about"
          className={`pb-1 ${location.pathname === '/user/about' ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`}
        >
          ABOUT
        </Link>
        <Link
          to="/user/contact"
          className={`pb-1 ${location.pathname === '/user/contact' ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`}
        >
          CONTACT
        </Link>
      </ul>
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
          <img
            src={user?.profilePhoto || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover"
          />
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg py-1">
            <Link
              to={`/user/${id}`}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
              <User size={16} /> Profile
            </Link>
            <button
              onClick={handlelogout}
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
