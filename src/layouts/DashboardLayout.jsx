import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
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
import instituteLogo from "../assets/banner/banner1.png";
import useAxios from "../hooks/useAxiosSecure";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";



const DashboardLayout = () => {
    const location = useLocation();
    const Axios = useAxios();
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userName, setUserName] = useState("");
    const [userLname, setUserLname] = useState("");
    const [userRole, setUserRole] = useState("");
    const [userBranch, setUserBranch] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const getAuthHeaders = () => {
        return {
            "Content-Type": "application/json",
        };
    };

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
                title: "আপনি কি নিশ্চিত?",
                text: "অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?",
                icon: "question",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "হ্যাঁ, লগআউট",
                cancelButtonText: "বাতিল",
            });

            if (result.isConfirmed) {
                const response = await Axios.post("/logout");
                if (response.data.success) {
                    Swal.fire({
                        title: "লগআউট সফল!",
                        text: "সফলভাবে লগআউট হয়েছে।",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false,
                    });
                    setTimeout(() => {
                        setIsAuthenticated(false);
                        navigate("/");
                    }, 1500);
                }
            }
        } catch {
            Swal.fire({
                title: "লগআউট ব্যর্থ",
                text: "লগআউট করতে সমস্যা হয়েছে।",
                icon: "error",
                confirmButtonText: "ঠিক আছে",
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Top Navbar */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-gray-200">
                <div className="flex items-center justify-between px-4 h-20">
                    {/* Left: Logo & Menu Toggle */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        <Link
                            to="/dashboard"
                            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
                        >
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-lg">
                                <img
                                    src={instituteLogo}
                                    className="w-full h-full rounded-full bg-white p-1"
                                    alt="NYSDTI Logo"
                                />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="text-xl font-bold text-gray-800">NYSDTI</h1>
                            </div>
                        </Link>
                    </div>

                    {/* Right: User Info & Actions */}
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800">
                                    {userName} {userLname}
                                </p>
                                <p className="text-xs text-gray-600">{userRole}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {userName?.charAt(0)}
                            </div>
                        </div>
                        <Link
                            to="/"
                            className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-none hover:shadow-lg gap-2"
                        >
                            <Home size={16} />
                            <span className="hidden sm:inline">হোম</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="btn btn-sm bg-gradient-to-r from-red-500 to-red-600 text-white border-none hover:shadow-lg gap-2"
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">লগআউট</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar & Main Content Wrapper */}
            <div className="flex pt-20">
                {/* Sidebar */}
                <aside
                    className={`fixed top-20 left-0 bottom-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 overflow-y-auto ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                        } lg:translate-x-0`}
                >
                    <div className="p-6">
                        {menuItems.map((section, idx) => (
                            <div key={idx} className="mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
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
                    <div className=" bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-50 to-transparent">
                        <div className="text-center text-xs text-gray-600">
                            <p className="font-semibold">© 2026 NYSDTI</p>
                            <p>National Youth Skill Development Training Institute</p>
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    ></div>
                )}

                {/* Main Content */}
                <main className="flex-1 lg:ml-72 p-6">
                    <div className="max-w-8xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
