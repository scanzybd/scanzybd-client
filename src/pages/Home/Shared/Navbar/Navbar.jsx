import React from 'react';
import ProFastLogo from '../Logo/ProFastLogo';
import { HashLink } from 'react-router-hash-link';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useAuth from '../../../../hooks/useAuth';
import useCart from '../../../../hooks/useCart'; // ✅ FIXED IMPORT

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { logOut, user } = useAuth();
  const { cartItems } = useCart(); // ✅ cart context


  const handleLogOut = () => {
    logOut();
    navigate("/");
  };

  const navItems = (
    <>
      <li>
        <HashLink
          smooth
          to="/"
          className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${
            location.pathname === '/' && !location.hash ? 'bg-white shadow-sm' : ''
          }`}
        >
          Home
        </HashLink>
      </li>

      <li>
        <HashLink
          smooth
          to="/#services"
          className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${
            location.hash === '#services' ? 'bg-white shadow-sm' : ''
          }`}
        >
          Products
        </HashLink>
      </li>

      <li>
        <HashLink
          to="/aboutUs"
          className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${
            location.pathname === '/aboutUs' ? 'bg-white shadow-sm' : ''
          }`}
        >
          About Us
        </HashLink>
      </li>

      <li>
        <HashLink
          to="/contact"
          className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${
            location.pathname === '/contact' ? 'bg-white shadow-sm' : ''
          }`}
        >
          Contact
        </HashLink>
      </li>

      {user && (
        <li>
          <Link
            to="/dashboard"
            className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${
              location.pathname === '/dashboard' ? 'bg-white shadow-sm' : ''
            }`}
          >
            Dashboard
          </Link>
        </li>
      )}
    </>
  );

  return (
    <div className="navbar sticky top-0 z-50 bg-yellow-300/95 backdrop-blur-sm border-b border-yellow-200 shadow-lg shadow-yellow-500/20">

      {/* LEFT */}
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            ☰
          </div>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow"
          >
            {navItems}
          </ul>
        </div>

        <Link to="/" className="btn btn-ghost text-xl">
          <ProFastLogo />
        </Link>
      </div>

      {/* CENTER */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {navItems}
        </ul>
      </div>

      {/* RIGHT */}
      <div className="navbar-end gap-3">

        {/* ✅ CART ICON WITH BADGE */}
        <Link to="/user/my-cart" className="btn btn-ghost btn-circle relative">
          <ShoppingCart className="w-5 h-5 text-yellow-800" />

          {cartItems?.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItems.length}
            </span>
          )}
        </Link>

        {/* AUTH BUTTONS */}
        {!user && (
          <>
            <Link
              to="/login"
              className="btn rounded-xl bg-yellow-500 text-gray-900 hover:bg-yellow-600 px-5"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="btn rounded-xl bg-yellow-500 text-gray-900 hover:bg-yellow-600 px-5"
            >
              Sign Up
            </Link>
          </>
        )}

        {/* PROFILE DROPDOWN */}
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-yellow-500 flex items-center justify-center font-bold">
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            <ul className="dropdown-content menu bg-base-100 rounded-box w-52 p-2 shadow">
              <li className="px-3 py-2 text-sm font-semibold">
                {user?.displayName || user?.email}
              </li>

              <hr className="my-2" />

              <li>
                <Link to="/user/profile">My Profile</Link>
              </li>

              <li>
                <Link to="/user/settings">Settings</Link>
              </li>

              <hr className="my-2" />

              <li>
                <button onClick={handleLogOut} className="text-red-500">
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