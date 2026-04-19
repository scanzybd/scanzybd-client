import React from 'react';
import ProFastLogo from '../Logo/ProFastLogo';
import { HashLink } from 'react-router-hash-link';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import useAuth from '../../../../hooks/useAuth';
import useCart from '../../../../hooks/useCart';
import LanguageSwitcher from '../../../../components/LanguageSwitcher';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { logOut, user, userRole, loading } = useAuth();
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
          to="/Products"
          className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${
            location.pathname === '/Products' ? 'bg-white shadow-sm' : ''
          }`}
        >
          Products
        </HashLink>
      </li>

      <li>
        <HashLink
          to="/about"
          className={`px-3 py-2 rounded-xl transition-colors duration-200 text-gray-900 hover:bg-yellow-200 ${
            location.pathname === '/about' ? 'bg-white shadow-sm' : ''
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

      {user && (userRole === "admin" || userRole === "provider") && (
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
    <header className="sticky top-0 z-50 border-b border-yellow-200 bg-yellow-300/95 backdrop-blur-sm shadow-lg shadow-yellow-500/20">
      <div className="app-container">
        <div className="navbar min-h-16 px-0">
          {/* LEFT */}
          <div className="navbar-start gap-1">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                ☰
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-64 max-w-[80vw] p-2 shadow"
              >
                {navItems}
              </ul>
            </div>

            <Link to="/" className="btn btn-ghost px-2 text-lg sm:text-xl">
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
          <div className="navbar-end gap-1 sm:gap-2 lg:gap-3">
            {/* <LanguageSwitcher /> */}
            <Link to="/user/my-cart" className="btn btn-ghost btn-circle relative">
              <ShoppingCart className="h-5 w-5 text-yellow-800" />

              {cartItems?.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {!user && !loading && (
              <>
                <Link
                  to="/login"
                  className="btn rounded-xl bg-yellow-500 px-3 text-gray-900 hover:bg-yellow-600 sm:px-5"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="btn hidden rounded-xl bg-yellow-500 px-5 text-gray-900 hover:bg-yellow-600 sm:inline-flex"
                >
                  Sign Up
                </Link>
              </>
            )}

            {loading && (
              <span className="loading loading-spinner loading-sm text-yellow-700" />
            )}

            {user && !loading && (
              <Link
                to={userRole === "admin" || userRole === "provider" ? "/dashboard" : "/user/user-profile"}
                className="btn hidden rounded-xl bg-white/80 px-4 text-slate-800 hover:bg-white md:inline-flex"
              >
                {userRole === "admin" || userRole === "provider" ? "Dashboard" : "My Account"}
              </Link>
            )}

            {user && !loading && (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="flex w-10 items-center justify-center rounded-full bg-yellow-500 font-bold">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>

                <ul className="dropdown-content menu bg-base-100 rounded-box z-[60] mt-2 w-52 p-2 shadow">
                  <li className="px-3 py-2 text-sm font-semibold">
                    {user?.displayName || user?.email}
                  </li>
                  <li className="px-3 pb-2 text-xs text-slate-500">
                    Role: {userRole || "user"}
                  </li>

                  <hr className="my-2" />

                  {(userRole === "admin" || userRole === "provider") && (
                    <li>
                      <Link to="/dashboard">Dashboard</Link>
                    </li>
                  )}
                  <li>
                    <Link to="/user/user-profile">Profile</Link>
                  </li>
                  <li>
                    <Link to="/user/user-orders">Orders</Link>
                  </li>
                  <li>
                    <Link to="/user/my-purchases">Product validity</Link>
                  </li>
                  <li>
                    <Link to="/user/my-vehiclePage">Vehicles</Link>
                  </li>
                  <li>
                    <Link to="/user/payment">Payments</Link>
                  </li>
                  <li>
                    <Link to="/user/user-settings">Settings</Link>
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
      </div>
    </header>
  );
};

export default Navbar;