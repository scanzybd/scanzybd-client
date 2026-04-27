/**
 * Single source of truth for lazy route modules — used by router + idle prefetch
 * so navigation rarely shows Suspense fallback after warm-up.
 */

export const loadHome = () => import("../pages/Home/Home/Home.jsx");
export const loadAbout = () => import("../pages/Home/About/About.jsx");
export const loadContactPage = () => import("../pages/Home/Contact/ContactPage.jsx");
export const loadProductPage = () => import("../pages/Home/ProductDetails/ProductPage.jsx");
export const loadProductShowcase = () => import("../pages/Home/ProductShowcase/ProductShowcase.jsx");
export const loadQrLandingPage = () => import("../pages/Home/QrLanding/QrLandingPage.jsx");
export const loadFooterStaticPage = () =>
  import("../pages/Home/FooterPages/FooterStaticPage.jsx");

export const loadLogin = () => import("../pages/Authentication/Login/Login.jsx");
export const loadRegister = () => import("../pages/Authentication/Register/Register.jsx");
export const loadForgotPassword = () => import("../pages/Authentication/ForgotPassword/ForgotPassword.jsx");
export const loadEnterCode = () => import("../pages/Authentication/ForgotPassword/EnterCode.jsx");
export const loadResetPassword = () => import("../pages/Authentication/ForgotPassword/ResetPassword.jsx");
export const loadPaymentReject = () =>
  import("../pages/Dashboard/Order/PaymentStatus/PaymentReject.jsx");
export const loadPaymentSuccess = () =>
  import("../pages/Dashboard/Order/PaymentStatus/PaymentSuccess.jsx");

export const loadPayment = () => import("../pages/User/Payment/Payment.jsx");
export const loadMyVehiclePage = () => import("../pages/User/UserVehicle/MyVehiclePage.jsx");
export const loadUserAddVehiclePage = () => import("../pages/User/UserVehicle/UserAddVehiclePage.jsx");
export const loadMyCart = () => import("../pages/User/Cart/MyCart.jsx");
export const loadCheckout = () => import("../pages/Dashboard/Order/Checkout.jsx");
export const loadUserProfile = () => import("../pages/User/Profile/UserProfile.jsx");
export const loadUserSettings = () => import("../pages/User/Settings/UserSettings.jsx");
export const loadUserOrders = () => import("../pages/User/UserOrders/UserOrders.jsx");
export const loadMyPurchases = () => import("../pages/User/MyPurchases/MyPurchases.jsx");

export const loadDashboardHome = () => import("../pages/Dashboard/DashboardHome/DashboardHome.jsx");
export const loadAllOrders = () => import("../pages/Dashboard/Order/AllOrders.jsx");
export const loadCancelledOrders = () => import("../pages/Dashboard/Order/CancelledOrders.jsx");
export const loadPendingOrders = () => import("../pages/Dashboard/Order/PendingOrders.jsx");
export const loadOrderReports = () => import("../pages/Dashboard/Order/OrderReports.jsx");
export const loadCompletedOrders = () => import("../pages/Dashboard/Order/CompletedOrders.jsx");
export const loadAllProducts = () => import("../pages/Dashboard/Product/AllProducts.jsx");
export const loadAddProducts = () => import("../pages/Dashboard/Product/AddProducts.jsx");
export const loadAllQR = () => import("../pages/Dashboard/QR/AllQR.jsx");
export const loadGenerateQR = () => import("../pages/Dashboard/QR/GenerateQR.jsx");
export const loadFinanceManagement = () => import("../pages/Dashboard/Finance/FinanceManagement.jsx");
export const loadAllPackages = () => import("../pages/Dashboard/Package/AllPackages.jsx");
export const loadAddPackages = () => import("../pages/Dashboard/Package/AddPackages.jsx");
export const loadQrScanner = () => import("../pages/Dashboard/QR/QrScanner.jsx");
export const loadAddVehiclePage = () => import("../pages/Dashboard/Vehicle/AddVehiclePage.jsx");
export const loadAssignVehiclePage = () => import("../pages/Dashboard/Vehicle/AssignVehiclePage.jsx");
export const loadScanAssignPage = () => import("../pages/Dashboard/Vehicle/ScanAssignPage.jsx");
export const loadAllVehiclePage = () => import("../pages/Dashboard/Vehicle/AllVehiclePage.jsx");
export const loadAssignVehiclebyId = () => import("../pages/Dashboard/Vehicle/AssignVehiclebyId.jsx");
export const loadUserManagementPage = () => import("../pages/Dashboard/Users/UserManagementPage.jsx");
export const loadAddUserPage = () => import("../pages/Dashboard/Users/AddUserPage.jsx");
export const loadAddProviderPage = () => import("../pages/Dashboard/Users/AddProviderPage.jsx");
export const loadReviewManagement = () => import("../pages/Dashboard/Reviews/ReviewManagement.jsx");
export const loadContactInbox = () => import("../pages/Dashboard/Contact/ContactInbox.jsx");

/** All route page chunks — prefetched in idle time so clicks feel instant */
export const allRouteChunkLoaders = [
  loadHome,
  loadAbout,
  loadContactPage,
  loadProductPage,
  loadProductShowcase,
  loadQrLandingPage,
  loadFooterStaticPage,
  loadLogin,
  loadRegister,
  loadForgotPassword,
  loadEnterCode,
  loadResetPassword,
  loadPaymentReject,
  loadPaymentSuccess,
  loadPayment,
  loadMyVehiclePage,
  loadUserAddVehiclePage,
  loadMyCart,
  loadCheckout,
  loadUserProfile,
  loadUserSettings,
  loadUserOrders,
  loadMyPurchases,
  loadDashboardHome,
  loadAllOrders,
  loadCancelledOrders,
  loadPendingOrders,
  loadOrderReports,
  loadCompletedOrders,
  loadAllProducts,
  loadAddProducts,
  loadAllQR,
  loadGenerateQR,
  loadFinanceManagement,
  loadAllPackages,
  loadAddPackages,
  loadQrScanner,
  loadAddVehiclePage,
  loadAssignVehiclePage,
  loadScanAssignPage,
  loadAllVehiclePage,
  loadAssignVehiclebyId,
  loadUserManagementPage,
  loadAddUserPage,
  loadAddProviderPage,
  loadReviewManagement,
  loadContactInbox,
];
