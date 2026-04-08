import React from 'react';
import ProFastLogo from '../Logo/ProFastLogo';
import { HashLink } from 'react-router-hash-link';
import { Navigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useAuth from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { logOut, user } = useAuth();

  const handleLogOut = () => {
    logOut();
    navigate("/login");
  }

  const navItems = <>
    <li>
      <HashLink
        smooth
        to="/"
        className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${location.pathname === '/' && !location.hash ? 'bg-white shadow-sm' : ''}`}
      >
        Home
      </HashLink>
    </li>
    <li>
      <HashLink
        smooth
        to="/#services"
        className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${location.hash === '#services' ? 'bg-white shadow-sm' : ''}`}
      >
        Products
      </HashLink>
    </li>
    <li>
      <HashLink
        to="/aboutUs"
        className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${location.pathname === '/aboutUs' ? 'bg-white shadow-sm' : ''}`}
      >
        About Us
      </HashLink>
    </li>
    <li>
      <HashLink
        to="/contact"
        className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${location.pathname === '/contact' ? 'bg-white shadow-sm' : ''}`}
      >
        Contact
      </HashLink>
    </li>
    
    {user && (
      <li>
        <Link
          to="/dashboard"
          className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${location.pathname === '/dashboard' ? 'bg-white shadow-sm' : ''}`}
        >
          Dashboard
        </Link>
      </li>
    )}
  </>;

  return (
    <div className="navbar sticky top-0 z-50 bg-yellow-300/95 backdrop-blur-sm border-b border-yellow-200 shadow-lg shadow-yellow-500/20">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex="-1"
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
            {navItems}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl">
          <ProFastLogo />
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navItems}
        </ul>
      </div>

      <div className="navbar-end gap-3">
        <Link to="/#services" className="btn btn-ghost btn-circle text-yellow-700 hover:text-yellow-900 transition-all duration-200">
          <ShoppingCart className="w-5 h-5" />
        </Link>

        {/* Show Sign In only when NOT logged in */}
        {!user && (
          <Link to="/login" className="btn rounded-xl bg-yellow-500 text-gray-900 hover:bg-yellow-600 border border-transparent px-5 py-2 transition-all duration-200">
            Sign In
          </Link>
        )}

        {/* Show Sign Up only when NOT logged in */}
        {!user && (
          <Link to="/register" className="btn rounded-xl bg-yellow-500 text-gray-900 hover:bg-yellow-600 border border-transparent px-6 py-2 transition-all duration-200">
            Sign Up
          </Link>
        )}

        {/* Show Profile Dropdown only when logged in */}
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-yellow-500 flex items-center justify-center text-gray-900 font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow">
              <li className="px-3 py-2 text-sm font-semibold text-gray-700">
                {user?.displayName || user?.email}
              </li>
              <hr className="my-2" />
              <li>
                <Link to="/user/profile" className="px-3 py-2">
                  My Profile
                </Link>
              </li>
              <li>
                <Link to="/user/settings" className="px-3 py-2">
                  Settings
                </Link>
              </li>
              <hr className="my-2" />
              <li>
                <button onClick={handleLogOut} className="px-3 py-2 text-red-500">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>

    </div>
  );
};

export default Navbar;