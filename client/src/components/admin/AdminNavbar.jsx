import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User, LogOut, Menu } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../../axiosInstance';

export default function AdminNavbar() {
  const id = localStorage.getItem("id");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [admin, setAdmin] = useState(() => {
    const cached = localStorage.getItem("admin");
    return cached ? JSON.parse(cached) : null;
  });

  const dropdownRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axiosInstance.get(`/admins/${id}`).then(res => {
      setAdmin(res.data);
      localStorage.setItem("admin", JSON.stringify(res.data));
    }).catch(err => {
      console.error('Failed to fetch admin:', err);
    });
  }, [id]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    localStorage.clear();
    navigate('/');
  }

  function desktopLinkClass(path) {
    return `pb-1 ${location.pathname === path ? 'text-[#2A1D7C] border-b-2 border-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`;
  }

  function mobileLinkClass(path) {
    return `px-2 py-1 ${location.pathname === path ? 'border-l-4 border-[#2A1D7C] text-[#2A1D7C]' : 'hover:text-[#2A1D7C]'}`;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4 border-b shadow-sm bg-white">
      <div className="flex items-center gap-4">
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
          <Menu className="w-6 h-6 text-gray-700" />
        </button>
        <img src="/logo.png" alt="Psycare" className="h-10" />
      </div>

      <ul className="hidden md:flex items-center space-x-10 text-[17px] font-medium">
        <Link to="/admin/home" className={desktopLinkClass('/admin/home')}>HOME</Link>
        <Link to="/admin/requests" className={desktopLinkClass('/admin/requests')}>REQUESTS</Link>
        <Link to="/admin/appointments" className={desktopLinkClass('/admin/appointments')}>APPOINTMENTS</Link>
      </ul>

      <div className="relative" ref={dropdownRef}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2">
          <img
            src={admin?.profilePhoto || 'https://via.placeholder.com/150'}
            alt="Profile"
            className="h-10 w-10 rounded-full object-cover"
            loading="lazy"
          />
          <ChevronDown className="w-5 h-5 text-gray-600" />
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg py-1 z-50">
            <Link
              to={`/admin/${id}`}
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

      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b md:hidden shadow-md z-40">
          <ul className="flex flex-col px-6 py-4 space-y-4 text-base font-medium text-gray-700">
            <Link to="/admin/home" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/admin/home')}>HOME</Link>
            <Link to="/admin/requests" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/admin/requests')}>REQUESTS</Link>
            <Link to="/admin/appointments" onClick={() => setMobileMenuOpen(false)} className={mobileLinkClass('/admin/appointments')}>APPOINTMENTS</Link>
          </ul>
        </div>
      )}
    </nav>
  );
}
