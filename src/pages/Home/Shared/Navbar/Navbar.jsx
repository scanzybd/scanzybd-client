import React from 'react';
import ProFastLogo from '../Logo/ProFastLogo';
import { HashLink } from 'react-router-hash-link';
import { Navigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAuth from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';


const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate(); // ✅ get navigate hook


  const { logOut, user } = useAuth();

  const handleLogOut = () => {
    logOut();
    navigate("/login"); // ✅ correct navigation

  }

  const navItems = <>
    <li>
      <HashLink
        smooth
        to="/"
        className={`px-3 py-2 rounded-xl ${location.pathname === '/' && !location.hash ? 'bg-blue-400' : ''}`}
      >
        Home
      </HashLink>

    </li>
    <li>
      <HashLink
        smooth
        to="/#services"
        className={`px-3 py-2 rounded-xl ${location.hash === '#services' ? 'bg-blue-400' : ''}`}
      >
        Services
      </HashLink>
    </li>
    <li>
      <HashLink
        to="/aboutUs"
        className={`px-3 py-2 rounded-xl ${location.pathname === '/aboutUs' ? 'bg-blue-400' : ''}`}
      >
        About Us
      </HashLink>
    </li>
    <li>
      <HashLink
        to="/pricingCalculator"
        className={`px-3 py-2 rounded-xl ${location.pathname === '/pricingCalculator' ? 'bg-blue-400' : ''}`}
      >
        Pricing
      </HashLink>
    </li>
    <li>
      <HashLink
        to="/beARider"
        className={`px-3 py-2 rounded-xl ${location.pathname === '/beARider' ? 'bg-blue-400' : ''}`}
      >
        Be A Rider
      </HashLink>
    </li>
    <li>
      <HashLink
        to="/sendParcelSection"
        className={`px-3 py-2 rounded-xl ${location.pathname === '/sendParcelSection' ? 'bg-blue-400' : ''}`}
      >
        Send Parcel
      </HashLink>
    </li>
    <li>
      <HashLink
        to="/mapSection"
        className={`px-3 py-2 rounded-xl ${location.pathname === '/mapSection' ? 'bg-blue-400' : ''}`}
      >
        Coverage
      </HashLink>
    </li>
  </>;

  return (
    <div className="navbar bg-yellow-300 shadow-sm rounded-xl">
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

        {/* Show Sign In only when NOT logged in */}
        {!user && (
          <Link to="/login" className="btn rounded-xl">
            Sign In
          </Link>
        )}

        {/* Show Logout only when logged in */}
        {user && (
          <button onClick={handleLogOut} className="btn rounded-xl">
            Logout
          </button>
        )}
        {!user && (
          <div className="flex items-center">
            <Link to="/register" className="btn rounded-xl  px-6 py-2 transition">
              Sign Up
            </Link>


          </div>
        )}
      </div>

    </div>
  );
};

export default Navbar;
