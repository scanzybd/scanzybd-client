import React from 'react';
import Logo from "../Logo/logo";
import { HashLink } from 'react-router-hash-link';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from "react-i18next";
import { ShoppingCart } from 'lucide-react';
import useAuth from '../../../../hooks/useAuth';
import useCart from '../../../../hooks/useCart';
import ThemeToggle from '../../../../components/ThemeToggle';
import Swal from "sweetalert2";

const navLinkClass = (active) =>
  `px-3 py-2 rounded-xl transition-colors duration-200 text-slate-800 hover:bg-yellow-500  dark:text-slate-100 dark:hover:bg-slate-800 ${
    active
      ? "bg-yellow-400 shadow-sm ring-1 ring-slate-300 dark:bg-slate-800 dark:ring-slate-700"
      : ""
  }`;

const Navbar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const { logOut, user, userRole, loading } = useAuth();
  const { cartItems } = useCart();

  const closeDropdown = () => {
    document.activeElement?.blur();
  };

  const handleLogOut = async () => {
    const result = await Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to logout?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
      focusCancel: true,
    });

    if (!result.isConfirmed) return;

    try {
      await logOut();
      navigate("/");

      await Swal.fire({
        icon: "success",
        title: "Logged out",
        text: "You have been logged out successfully.",
        timer: 1400,
        showConfirmButton: false,
      });
    } catch {
      await Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: "Please try again.",
      });
    }
  };

  const navItems = (
    <>
      <li>
        <HashLink
          smooth
          to="/"
          className={navLinkClass(
            location.pathname === "/" && !location.hash
          )}
        >
          {t("nav.home")}
        </HashLink>
      </li>

      <li>
        <HashLink
          smooth
          to="/product"
          className={navLinkClass(location.pathname === "/product")}
        >
          {t("nav.products")}
        </HashLink>
      </li>

      <li>
        <HashLink
          to="/about"
          className={navLinkClass(location.pathname === "/about")}
        >
          {t("nav.about")}
        </HashLink>
      </li>

      <li>
        <HashLink
          to="/contact"
          className={navLinkClass(location.pathname === "/contact")}
        >
          {t("nav.contact")}
        </HashLink>
      </li>
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/95 backdrop-blur-sm shadow-sm dark:border-slate-700/90 dark:bg-slate-950/95">
      <div className="app-container">

        {/* NAVBAR */}
        <div className="grid grid-cols-[auto_1fr] lg:grid-cols-3 items-center min-h-16 gap-2">

          {/* LEFT */}
          <div className="flex items-center justify-start gap-1 min-w-0">

            {/* MOBILE MENU */}
            <div className="dropdown">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-sm lg:hidden"
              >
                ☰
              </div>

              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-64 max-w-[80vw] p-2 shadow z-[60]"
              >
                {navItems}
              </ul>
            </div>

            {/* LOGO */}
            <Link
              to="/"
              className="btn btn-ghost shrink-0 px-0 sm:px-1"
            >
              <Logo />
            </Link>
          </div>

          {/* CENTER NAV */}
          <div className="hidden lg:flex justify-center">
            <ul className="menu menu-horizontal gap-1">
              {navItems}
            </ul>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-1 sm:gap-2 lg:gap-3 flex-nowrap min-w-0">

            {/* THEME */}
            <div className="shrink-0 [&_svg]:text-slate-700 dark:[&_svg]:text-slate-200">
              <ThemeToggle />
            </div>

            {/* CART */}
            <Link
              to="/user/my-cart"
              className="btn btn-ghost btn-circle btn-sm sm:btn-md relative shrink-0"
            >
              <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-200" />

              {cartItems?.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  {cartItems.length}
                </span>
              )}
            </Link>

            {/* LOGIN */}
            {!user && !loading && (
              <Link
                to="/login"
                className="btn h-9 min-h-9 rounded-xl border-0 bg-yellow-400 px-2 text-[11px] text-slate-900 shadow-sm hover:bg-yellow-500 sm:h-10 sm:min-h-10 sm:px-4 sm:text-sm whitespace-nowrap"
              >
                {t("nav.signIn")}
              </Link>
            )}

            {/* LOADING */}
            {loading && (
              <span className="loading loading-spinner loading-sm text-slate-700 dark:text-slate-300" />
            )}

            {/* USER MENU */}
            {user && !loading && (
              <div className="dropdown dropdown-end shrink-0">
                <div
                  tabIndex={0}
                  role="button"
                  className="btn btn-ghost btn-circle avatar"
                >
                  <div className="flex w-9 sm:w-10 items-center justify-center rounded-full bg-yellow-500 font-bold text-slate-900 shadow-sm ring-2 ring-amber-600/20 dark:text-slate-950">
                    {user?.displayName?.charAt(0).toUpperCase() || "👤"}
                  </div>
                </div>

                <ul className="dropdown-content menu bg-base-100 rounded-box z-[60] mt-2 w-52 p-2 shadow">
                  <li className="px-3 py-2 text-sm font-semibold">
                    {user?.displayName || user?.email}
                  </li>

                  <hr className="my-2" />

                  {(userRole === "admin" || userRole === "provider") && (
                    <li>
                      <Link to="/dashboard" onClick={closeDropdown}>
                        {t("nav.dashboard")}
                      </Link>
                    </li>
                  )}

                  <li>
                    <Link
                      to="/user/user-profile"
                      onClick={closeDropdown}
                    >
                      {t("user.menu.profile")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/user/user-orders"
                      onClick={closeDropdown}
                    >
                      {t("user.menu.orders")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/user/my-purchases"
                      onClick={closeDropdown}
                    >
                      {t("user.menu.subscription")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/user/my-vehiclePage"
                      onClick={closeDropdown}
                    >
                      {t("user.menu.vehicles")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/user/payment"
                      onClick={closeDropdown}
                    >
                      {t("user.menu.payments")}
                    </Link>
                  </li>

                  <li>
                    <Link
                      to="/user/user-settings"
                      onClick={closeDropdown}
                    >
                      {t("user.menu.settings")}
                    </Link>
                  </li>

                  <hr className="my-2" />

                  <li>
                    <button
                      onClick={handleLogOut}
                      className="text-red-500 font-bold"
                    >
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