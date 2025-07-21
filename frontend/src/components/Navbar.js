import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/userSlice';
import avatars from '../assets/avatars';

export default function Navbar() {
  const user = useSelector(state => state.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="glass flex justify-between items-center px-8 py-4 mb-8 fixed w-full z-10 top-0 left-0 bg-opacity-80">
      <Link to="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-gray-900" style={{letterSpacing: '0.01em'}}>
        <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="20" cy="32" rx="12" ry="8" stroke="#6366f1" strokeWidth="4" fill="none"/>
          <ellipse cx="44" cy="32" rx="12" ry="8" stroke="#6366f1" strokeWidth="4" fill="none"/>
          <path d="M32 40c-4 0-8-3.582-8-8s4-8 8-8 8 3.582 8 8-4 8-8 8z" fill="#6366f1" fillOpacity=".2"/>
        </svg>
        InfinityBlogger
      </Link>
      <div className="flex items-center">
        <div className="relative flex items-center gap-2" ref={menuRef}>
          {user && (
            <img
              src={user.profilePic || avatars[0]}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-blue-200"
            />
          )}
          <button
            className="focus:outline-none flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
            onClick={() => setDropdownOpen(v => !v)}
            aria-label="Menu"
          >
            <span className="text-3xl text-gray-700">&#8942;</span>
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg py-2 z-50 animate-fade-in">
              {user ? (
                <>
                  <Link
                    to="/blogs/create"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-apple"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Create
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-apple"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  {user.isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-apple"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-apple"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-apple"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-2 text-gray-800 hover:bg-gray-100 font-apple"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
} 