import { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

export default function UserNavbar() {
  const id = localStorage.getItem("id");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("user");
    return cached ? JSON.parse(cached) : null;
  });

  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Background update of user info (without blocking UI)
  useEffect(() => {
    axiosInstance.get(`/users/${id}`).then(res => {
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
    }).catch(console.error);
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

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 border-b shadow-sm bg-white">
      <div className="flex items-center space-x-2">
        <img src="/logo.png" alt="PsyCare" className="h-8" />
      </div>
      <ul className="flex items-center space-x-10 text-[17px] font-medium">
        {[
          { to: "/user/home", label: "HOME" },
          { to: "/user/doctors", label: "ALL DOCTORS" },
          { to: "/user/approved", label: "APPOINTMENTS" },
          { to: "/user/about", label: "ABOUT" },
          { to: "/user/contact", label: "CONTACT" }
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`pb-1 ${location.pathname === link.to
              ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]'
              : 'hover:text-[#2A1D7C]'}`}
          >
            {link.label}
          </Link>
        ))}
      </ul>
      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
          <img
            src={user?.profilePhoto || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover"
            loading="lazy"
          />
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg py-1 z-50">
            <Link
              to={`/user/${id}`}
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-sm text-gray-700"
            >
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
