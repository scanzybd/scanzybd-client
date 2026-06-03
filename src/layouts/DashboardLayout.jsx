import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    Home,
    LogOut,
    LayoutDashboard,
    GraduationCap,
    BookOpen,
    Users,
    UserCog,
    Award,
    FileText,
    Settings,
    UserPlus,
    BookMarked,
    ClipboardList,
    ShoppingCart,
    Wallet,
    Menu,
    Clock,
    Building2,
    Mail,
    Star,
} from "lucide-react";
import dashboardLogo from "../assets/logo/Logo Double Line.svg";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import { useEffect, useRef, useState } from "react";
import SmartLoader from "../components/SmartLoader";
import { COMPANY_NAME, COMPANY_TAGLINE } from "../config/company";

const ACCENT = "emerald";

const navLinkBase =
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150";

const DashboardLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, userRole, logOut, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const sidebarNavRef = useRef(null);
    const profileMenuRef = useRef(null);
    const userName = user?.name || user?.displayName || "User";
    const userEmail = user?.email || "";

    const handleLogout = async () => {
        try {
            const result = await Swal.fire({
                title: t("dashboard.logout.confirmTitle"),
                text: t("dashboard.logout.confirmText"),
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: t("dashboard.logout.yes"),
                cancelButtonText: t("dashboard.logout.cancel"),
            });

            if (result.isConfirmed) {
                await logOut();
                Swal.fire({
                    title: t("dashboard.logout.successTitle"),
                    text: t("dashboard.logout.successText"),
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                });
                navigate("/");
            }
        } catch (error) {
            console.error("Logout error:", error);
            Swal.fire({
                title: t("dashboard.logout.failTitle"),
                text: t("dashboard.logout.failText"),
                icon: "error",
                confirmButtonText: t("dashboard.logout.ok"),
            });
        }
    };

    const normalizePath = (p) => {
        const n = (p || "").replace(/\/+$/, "") || "/";
        return n;
    };

    const isActive = (path) => {
        const current = normalizePath(location.pathname);
        const target = normalizePath(path);
        if (target === "/dashboard") {
            return current === "/dashboard";
        }
        return current === target || current.startsWith(`${target}/`);
    };

    useEffect(() => {
        if (loading) return;
        const frame = requestAnimationFrame(() => {
            const nav = sidebarNavRef.current;
            if (!nav) return;
            const activeEl = nav.querySelector('[data-nav-active="true"]');
            activeEl?.scrollIntoView({ block: "nearest", inline: "nearest" });
        });
        return () => cancelAnimationFrame(frame);
    }, [location.pathname, loading, userRole]);

    useEffect(() => {
        setProfileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!profileOpen) return;

        const closeProfile = () => setProfileOpen(false);

        const handleOutside = (event) => {
            if (profileMenuRef.current?.contains(event.target)) return;
            closeProfile();
        };

        const handleEscape = (event) => {
            if (event.key === "Escape") closeProfile();
        };

        document.addEventListener("mousedown", handleOutside);
        document.addEventListener("touchstart", handleOutside, { passive: true });
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutside);
            document.removeEventListener("touchstart", handleOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [profileOpen]);

    const allMenuSections = [
        {
            category: t("dashboard.menu.main"),
            items: [
                {
                    path: "/dashboard",
                    icon: LayoutDashboard,
                    label: t("dashboard.menu.analytics"),
                },
            ],
        },
        {
            category: t("dashboard.menu.vehicle"),
            items: [
                { path: "/dashboard/all-vehicles", icon: GraduationCap, label: t("dashboard.menu.allVehicles") },
                { path: "/dashboard/assign-vehicle", icon: Users, label: t("dashboard.menu.assign") },
                { path: "/dashboard/scan-assign-vehicle", icon: Clock, label: t("dashboard.menu.scanAssign") },
            ],
        },
        {
            category: t("dashboard.menu.products"),
            items: [
                { path: "/dashboard/all-products", icon: BookOpen, label: t("dashboard.menu.productList") },
                { path: "/dashboard/add-product", icon: BookMarked, label: t("dashboard.menu.addProduct") },
            ],
        },
        {
            category: t("dashboard.menu.packages"),
            items: [
                { path: "/dashboard/all-packages", icon: BookOpen, label: t("dashboard.menu.packageList") },
                { path: "/dashboard/add-package", icon: BookMarked, label: t("dashboard.menu.addPackage") },
            ],
        },
        {
            category: t("dashboard.menu.orders"),
            items: [
                { path: "/dashboard/create-order", icon: ShoppingCart, label: t("dashboard.menu.createOrder") },
                { path: "/dashboard/orders", icon: ClipboardList, label: t("dashboard.menu.ordersList") },
                { path: "/dashboard/confirmed-orders", icon: FileText, label: t("dashboard.menu.confirmedOrders") },
            ],
        },
        {
            category: t("dashboard.menu.finance"),
            items: [
                { path: "/dashboard/finance-management", icon: Settings, label: t("dashboard.menu.finance") },
                { path: "/dashboard/payment-gateways", icon: Wallet, label: t("dashboard.menu.paymentGateways") },
                { path: "/dashboard/provider-due-list", icon: Wallet, label: t("dashboard.menu.providerDue") },
            ],
        },
        {
            category: t("dashboard.menu.qr"),
            items: [
                { path: "/dashboard/all-qr", icon: Award, label: t("dashboard.menu.allQr") },
                { path: "/dashboard/generate-qr", icon: FileText, label: t("dashboard.menu.generateQr") },
            ],
        },
        {
            category: t("dashboard.menu.support"),
            items: [
                { path: "/dashboard/reviews", icon: Star, label: t("dashboard.menu.reviews") },
                { path: "/dashboard/contact-messages", icon: Mail, label: t("dashboard.menu.messages") },
            ],
        },
        {
            category: t("dashboard.menu.users"),
            items: [
                { path: "/dashboard/user-management", icon: UserCog, label: t("dashboard.menu.userManagement") },
                { path: "/dashboard/add-user", icon: UserPlus, label: t("dashboard.menu.addUser") },
                { path: "/dashboard/add-provider", icon: Building2, label: t("dashboard.menu.addProvider") },
            ],
        },
    ];

    /** Provider: vehicle ops, catalog read-only, own-product orders (read-only lists) */
    const providerMenuSections = [
        {
            category: t("dashboard.menu.main"),
            items: [
                {
                    path: "/dashboard",
                    icon: LayoutDashboard,
                    label: t("dashboard.menu.analytics"),
                },
            ],
        },
        {
            category: t("dashboard.menu.vehicle"),
            items: [
                { path: "/dashboard/all-vehicles", icon: GraduationCap, label: t("dashboard.menu.allVehicles") },
                { path: "/dashboard/assign-vehicle", icon: Users, label: t("dashboard.menu.assign") },
                { path: "/dashboard/scan-assign-vehicle", icon: Clock, label: t("dashboard.menu.scanAssign") },
            ],
        },
        {
            category: t("dashboard.menu.products"),
            items: [{ path: "/dashboard/all-products", icon: BookOpen, label: t("dashboard.menu.productList") }],
        },
        {
            category: t("dashboard.menu.packages"),
            items: [{ path: "/dashboard/all-packages", icon: BookOpen, label: t("dashboard.menu.packageList") }],
        },
        {
            category: t("dashboard.menu.orders"),
            items: [
                { path: "/dashboard/create-order", icon: ShoppingCart, label: t("dashboard.menu.createOrder") },
                { path: "/dashboard/orders", icon: ClipboardList, label: t("dashboard.menu.ordersList") },
            ],
        },
        {
            category: t("dashboard.menu.finance"),
            items: [
                { path: "/dashboard/provider-finance", icon: Wallet, label: t("dashboard.menu.finance") },
            ],
        },
        {
            category: t("dashboard.menu.users"),
            items: [
                { path: "/dashboard/add-user", icon: UserPlus, label: t("dashboard.menu.addUser") },
            ],
        },
    ];

    const menuItems =
        userRole === "admin"
            ? allMenuSections.filter(
                  (section) => section.category !== "Users" || userRole === "admin"
              )
            : providerMenuSections;

    const linkClass = (path) =>
        `${navLinkBase} ${
            isActive(path)
                ? "border-l-[3px] border-emerald-500 bg-emerald-500/15 text-white"
                : "border-l-[3px] border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
        }`;

    if (loading) {
        return <SmartLoader fullPage label="Checking your role..." />;
    }

    return (
        <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-900">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    aria-label="Close menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — dark */}
            <aside
                className={`fixed bottom-0 left-0 top-0 z-50 flex w-[min(100vw-3rem,18rem)] flex-col border-r border-white/6 bg-[#141719] transition-transform duration-300 lg:w-72 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}
            >
                <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/6 px-4">
                    <img
                        src={dashboardLogo}
                        className="h-10 w-auto max-w-[132px] object-contain"
                        alt={COMPANY_NAME}
                        draggable={false}
                    />
                    <div className="min-w-0">
                        <p className="text-sm font-bold tracking-tight text-white">Dashboard</p>
                        <p className="truncate text-[10px] uppercase tracking-widest text-slate-500">
                            {COMPANY_TAGLINE}
                        </p>
                    </div>
                </div>

                <nav ref={sidebarNavRef} className="flex-1 overflow-y-auto px-2 py-4 scroll-smooth">
                    {menuItems.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            <h3 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                                {section.category}
                            </h3>
                            <ul className="space-y-0.5">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    const active = isActive(item.path);
                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={linkClass(item.path)}
                                                data-nav-active={active ? "true" : undefined}
                                                aria-current={active ? "page" : undefined}
                                            >
                                                <Icon size={18} className="shrink-0 opacity-90" />
                                                <span className="truncate">{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                <div className="border-t border-white/6 p-4 text-center text-[10px] leading-relaxed text-slate-500">
                    <p className="font-medium text-slate-400">
                        © {new Date().getFullYear()}
                    </p>
                    <p className="mt-0.5">{COMPANY_NAME}</p>
                </div>
            </aside>

            {/* Main column */}
            <div className="min-h-screen lg:pl-72">
                {/* Top bar */}
                <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200/90 bg-white/95 px-3 shadow-sm backdrop-blur-md dark:border-slate-700/90 dark:bg-slate-950/95 sm:px-5">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setSidebarOpen(true)}
                            className="btn btn-ghost btn-square text-slate-600 dark:text-slate-300 lg:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
                        <div className="relative" ref={profileMenuRef}>
                            <button
                                type="button"
                                onClick={() => setProfileOpen((prev) => !prev)}
                                className="hidden h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 text-sm font-bold text-white shadow-md sm:flex"
                                aria-haspopup="menu"
                                aria-expanded={profileOpen}
                                title={userName}
                            >
                                {userName?.charAt(0)?.toUpperCase() || "U"}
                            </button>
                            {profileOpen && (
                                <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {userName}
                                        </p>
                                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                                    </div>
                                    <Link
                                        to="/user/user-settings"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <Settings size={16} />
                                        {t("user.menu.settings")}
                                    </Link>
                                    <Link
                                        to="/"
                                        onClick={() => setProfileOpen(false)}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <Home size={16} />
                                        {t("dashboard.logout.home")}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            setProfileOpen(false);
                                            await handleLogout();
                                        }}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-rose-700 transition-colors hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40"
                                    >
                                        <LogOut size={16} />
                                        {t("dashboard.logout.logout")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="p-4 sm:p-6">
                    <div className="dashboard-main mx-auto w-full max-w-[1400px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
