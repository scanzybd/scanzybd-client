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
    Menu,
    X,
    XCircle,
    Clock,
} from "lucide-react";
import instituteLogo from "../assets/banner/banner.png";
import useAxios from "../hooks/useAxiosSecure";
import useAuth from "../hooks/useAuth";
import Swal from "sweetalert2";
import { useState } from "react";
import SmartLoader from "../components/SmartLoader";
import LanguageSwitcher from "../components/LanguageSwitcher";



const DashboardLayout = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const Axios = useAxios();
    const navigate = useNavigate();
    const { user, userRole, logOut, loading } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // const fetchUserInfo = async () => {
    //     try {
    //         const response = await fetch(`/dashboard/verify-token`, {
    //             method: "GET",
    //             headers: getAuthHeaders(),
    //             credentials: "include",
    //         });

    //         if (response.ok) {
    //             const data = await response.json();
    //             if (data.authenticated && data.user) {
    //                 setUserLname(data.user.lastName);
    //                 setUserName(data.user.firstName);
    //                 setUserRole(data.user.role);
    //                 setUserBranch(data.user.branch);
    //             }
    //         }
    //     } catch (error) {
    //         console.error("Error fetching user info:", error);
    //     }
    // };

    // useEffect(() => {
    //     fetchUserInfo();
    // }, []);

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

    const isActive = (path) => location.pathname === path;

    const menuItems = [
        {
            category: "Dashboard",
            items: [
                {
                    path: "/dashboard",
                    icon: LayoutDashboard,
                    label: "Analytics",
                    color: "blue",
                },
            ],
        },
        {
            category: "Vehicle Management",
            items: [
                {
                    path: "/dashboard/all-vehicles",
                    icon: GraduationCap,
                    label: "All Vehicles",
                    color: "green",
                },
                {
                    path: "/dashboard/add-vehicle",
                    icon: UserPlus,
                    label: "Add Vehicle",
                    color: "teal",
                },
                {
                  path: "/dashboard/assign-vehicle",
                  icon: Users,
                  label: "Assign Vehicle",
                  color: "red",  
                },
                {
                    path: "/dashboard/scan-assign-vehicle",
                    icon: Clock,
                    label: "Scan & Assign",
                    color: "yellow",
                }
            ],
        },
        {
            category: "Product Management",
            items: [
                {
                    path: "/dashboard/all-products",
                    icon: BookOpen,
                    label: "Product List",
                    color: "purple",
                },
                {
                    path: "/dashboard/add-product",
                    icon: BookMarked,
                    label: "Add Product",
                    color: "indigo",
                },
            ],
        },
        {
            category: "Package Management",
            items: [
                {
                    path: "/dashboard/all-packages",
                    icon: BookOpen,
                    label: "Package List",
                    color: "purple",
                },
                {
                    path: "/dashboard/add-package",
                    icon: BookMarked,
                    label: "Add Package",
                    color: "indigo",
                },
            ],
        },
        {
            category: "Order Management",
            items: [
                {
                    path: "/dashboard/all-orders",
                    icon: GraduationCap,
                    label: "Order List  ",
                    color: "green",
                },
                {
                    path: "/dashboard/completed-orders",
                    icon: UserPlus,
                    label: "Completed Orders",
                    color: "teal",
                },
                {
                    path: "/dashboard/pending-orders",
                    icon: Clock,
                    label: "Pending Orders",
                    color: "yellow",

                },
                {
                    path: "/dashboard/cancelled-orders",
                    icon: XCircle,
                    label: "Cancelled Orders",
                    color: "red",   
                },
                {
                    path: "/dashboard/order-reports",
                    icon: ClipboardList,
                    label: "Order Reports",
                    color: "gray",  
                },
                
            ],
        },
        {
            category: "Finance Management",
            items: [
                {
                    path: "/dashboard/finance-management",
                    icon: Settings,
                    label: "Finance Management",
                    color: "gray",
                },
            ],

        },
        {
            category: "QR Management",
            items: [
                {
                    path: "/dashboard/all-qr",
                    icon: Award,
                    label: "All QR Codes",
                    color: "orange",
                },
                {
                    path: "/dashboard/generate-qr",
                    icon: FileText,
                    label: "Generate QR Code",
                    color: "amber",
                },
            ],
        },
        {
            category: "User Management",
            items: [
                {
                    path: "/dashboard/user-management",
                    icon: UserCog,
                    label: "User Management",
                    color: "red",
                },
                {
                    path: "/dashboard/add-user",
                    icon: UserPlus,
                    label: "Add User",
                    color: "green",
                },
                
            ],
        },
    ];

    const getColorClasses = (color, isActive) => {
        const colors = {
            blue: isActive
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/50"
                : "text-blue-600 hover:bg-blue-50",
            purple: isActive
                ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-500/50"
                : "text-purple-600 hover:bg-purple-50",
            indigo: isActive
                ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/50"
                : "text-indigo-600 hover:bg-indigo-50",
            green: isActive
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/50"
                : "text-green-600 hover:bg-green-50",
            teal: isActive
                ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/50"
                : "text-teal-600 hover:bg-teal-50",
            yellow: isActive
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg shadow-yellow-500/50"
                : "text-yellow-600 hover:bg-yellow-50",
            orange: isActive
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/50"
                : "text-orange-600 hover:bg-orange-50",
            amber: isActive
                ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/50"
                : "text-amber-600 hover:bg-amber-50",
            red: isActive
                ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/50"
                : "text-red-600 hover:bg-red-50",
            gray: isActive
                ? "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/50"
                : "text-gray-600 hover:bg-gray-50",
        };
        return colors[color] || colors.blue;
    };

    // console.log("User Data in Dashboard:", userData);

    if (loading || !userRole) {
        return <SmartLoader fullPage label="Checking your role..." />;
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navbar */}
            <div className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
                <div className="flex h-16 items-center justify-between px-3 sm:h-18 sm:px-4 lg:px-6">
                    {/* Left: Logo & Menu Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="rounded-lg p-2 transition-colors hover:bg-slate-100 lg:hidden"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                        >
                            <div className="h-10 w-10 rounded-full bg-blue-600 p-1 shadow sm:h-12 sm:w-12">
                                <img
                                    src={instituteLogo}
                                    className="w-full h-full rounded-full bg-white p-1"
                                    alt="NYSDTI Logo"
                                />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-lg font-bold text-slate-800 sm:text-xl">NYSDTI</h1>
                            </div>
                        </Link>
                    </div>

                    {/* Right: User Info & Actions */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <LanguageSwitcher className="hidden sm:flex" />
                        <div className="hidden items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-800">
                                    {user?.displayName || user?.email || 'User'}
                                </p>
                                <p className="text-xs text-slate-600">{userRole || 'user'}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow">
                                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="btn btn-sm gap-2 border-none bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Home size={16} />
                            <span className="hidden sm:inline">{t("dashboard.logout.home")}</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="btn btn-sm gap-2 border-none bg-rose-600 text-white hover:bg-rose-700"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">{t("dashboard.logout.logout")}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar & Main Content Wrapper */}
            <div className="flex pt-16 sm:pt-18">
                {/* Sidebar */}
                <aside
                    className={`fixed bottom-0 left-0 top-16 z-40 w-72 transform overflow-y-auto border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out sm:top-18 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } lg:translate-x-0`}
                >
                    <div className="p-5">
                        {menuItems.map((section, idx) => (
                            <div key={idx} className="mb-6">
                                <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                                    {section.category}
                                </h3>
                                <ul className="space-y-1">
                                    {section.items.map((item) => {
                                        const Icon = item.icon;
                                        const active = isActive(item.path);
                                        return (
                                            <li key={item.path}>
                                                <Link
                                                    to={item.path}
                                                    onClick={() => setSidebarOpen(false)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${active ? "scale-105" : ""
                                                        } ${getColorClasses(item.color, active)}`}
                                                >
                                                    <Icon size={20} />
                                                    <span>{item.label}</span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Sidebar Footer */}
                    <div className="bottom-0 left-0 right-0 border-t border-slate-200 p-4">
                        <div className="text-center text-xs text-slate-600">
                            <p className="font-semibold">© 2026 NYSDTI</p>
                            <p>National Youth Skill Development Training Institute</p>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 p-3 sm:p-4 lg:ml-72 lg:p-6">
                    <div className="mx-auto w-full max-w-[1400px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
