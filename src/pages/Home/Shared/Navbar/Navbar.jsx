import React from 'react';
import Logo from "../Logo/logo";
import { HashLink } from 'react-router-hash-link';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { ShoppingCart } from 'lucide-react';
import useAuth from '../../../../hooks/useAuth';
import useCart from '../../../../hooks/useCart';
import ThemeToggle from '../../../../components/ThemeToggle';
import LanguageSwitcher from '../../../../components/LanguageSwitcher';

/** Neutral nav with soft amber accents for both themes */
const navLinkClass = (active) =>
  `px-3 py-2 rounded-xl transition-colors duration-200 text-slate-800 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800 ${
    active
      ? "bg-white shadow-sm ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700"
      : ""
  }`;

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { logOut, user, userRole, loading } = useAuth();
  const { cartItems } = useCart();

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
          className={navLinkClass(location.pathname === '/' && !location.hash)}
        >
          {t("nav.home")}
        </HashLink>
      </li>

      <li>
        <HashLink
          smooth
          to="/Products"
          className={navLinkClass(location.pathname === '/Products')}
        >
          {t("nav.products")}
        </HashLink>
      </li>

      <li>
        <HashLink
          to="/about"
          className={navLinkClass(location.pathname === '/about')}
        >
          {t("nav.about")}
        </HashLink>
      </li>

      <li>
        <HashLink
          to="/contact"
          className={navLinkClass(location.pathname === '/contact')}
        >
          {t("nav.contact")}
        </HashLink>
      </li>

      {user && (userRole === "admin" || userRole === "provider") && (
        <li>
          <Link
            to="/dashboard"
            className={navLinkClass(location.pathname === '/dashboard')}
          >
            {t("nav.dashboard")}
          </Link>
        </li>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-sm dark:border-slate-700/90 dark:bg-slate-950/95">
      <div className="app-container">
        <div className="navbar min-h-16 px-0">
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
              <Logo />
            </Link>
          </div>

          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1 gap-1">
              {navItems}
            </ul>
          </div>

          <div className="navbar-end gap-1 sm:gap-2 lg:gap-3">
            <LanguageSwitcher className="hidden sm:flex" />
            <div className="[&_svg]:text-slate-700 dark:[&_svg]:text-slate-200">
              <ThemeToggle />
            </div>
            <Link to="/user/my-cart" className="btn btn-ghost btn-circle relative">
              <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-200" />

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
                  className="btn rounded-xl border-0 bg-amber-500 px-3 text-slate-900 shadow-sm hover:bg-amber-600 sm:px-5"
                >
                  {t("nav.signIn")}
                </Link>

                <Link
                  to="/register"
                  className="btn hidden rounded-xl border-0 bg-amber-500 px-5 text-slate-900 shadow-sm hover:bg-amber-600 sm:inline-flex"
                >
                  {t("nav.signUp")}
                </Link>
              </>
            )}

            {loading && (
              <span className="loading loading-spinner loading-sm text-slate-700 dark:text-slate-300" />
            )}

            {user && !loading && (
              <Link
                to={userRole === "admin" || userRole === "provider" ? "/dashboard" : "/user/user-profile"}
                className="btn hidden rounded-xl border border-slate-300 bg-white px-4 text-slate-800 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 md:inline-flex"
              >
                {userRole === "admin" || userRole === "provider" ? t("nav.dashboard") : t("user.menu.myAccount")}
              </Link>
            )}

            {user && !loading && (
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="flex w-10 items-center justify-center rounded-full bg-amber-500 font-bold text-slate-900 shadow-sm ring-2 ring-amber-600/20 dark:text-slate-950">
                    {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>

                <ul className="dropdown-content menu bg-base-100 rounded-box z-60 mt-2 w-52 p-2 shadow">
                  <li className="px-3 py-2 text-sm font-semibold">
                    {user?.displayName || user?.email}
                  </li>
                  <li className="px-3 pb-2 text-xs text-slate-500">
                    {t("nav.role")}:{" "}
                    {loading
                      ? "…"
                      : userRole != null && userRole !== ""
                        ? userRole
                        : "—"}
                  </li>

                  <hr className="my-2" />

                  {(userRole === "admin" || userRole === "provider") && (
                    <li>
                      <Link to="/dashboard">{t("nav.dashboard")}</Link>
                    </li>
                  )}
                  <li>
                    <Link to="/user/user-profile">{t("user.menu.profile")}</Link>
                  </li>
                  <li>
                    <Link to="/user/user-orders">{t("user.menu.orders")}</Link>
                  </li>
                  <li>
                    <Link to="/user/my-purchases">{t("user.menu.subscription")}</Link>
                  </li>
                  <li>
                    <Link to="/user/my-vehiclePage">{t("user.menu.vehicles")}</Link>
                  </li>
                  <li>
                    <Link to="/user/payment">{t("user.menu.payments")}</Link>
                  </li>
                  <li>
                    <Link to="/user/user-settings">{t("user.menu.settings")}</Link>
                  </li>

                  <hr className="my-2" />

                  <li>
                    <button onClick={handleLogOut} className="text-red-500">
                      {t("user.menu.logout")}
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
