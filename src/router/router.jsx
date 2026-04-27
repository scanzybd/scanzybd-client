import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import Error404 from "../pages/ErrorSection/Error404";
import PrivateRoute from "../routes/PrivetRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import UserLayout from "../layouts/UserLayout";
import AdminRoute from "../routes/AdminRoute";
import { lazyPage, lazyImport, RouteFallback } from "./lazyRoute";
import * as chunks from "./routeChunks";

// ——— Public & marketing ———
const Home = lazyPage(chunks.loadHome);
const About = lazyPage(chunks.loadAbout);
const ContactPage = lazyPage(chunks.loadContactPage);
const ProductPage = lazyPage(chunks.loadProductPage);
const ProductShowcase = lazyPage(chunks.loadProductShowcase);
const QrLandingPage = lazyPage(chunks.loadQrLandingPage);
const FooterStaticPage = lazyPage(chunks.loadFooterStaticPage);

// ——— Auth ———
const Login = lazyPage(chunks.loadLogin);
const Register = lazyPage(chunks.loadRegister);
const ForgotPassword = lazyPage(chunks.loadForgotPassword);
const EnterCode = lazyPage(chunks.loadEnterCode);
const ResetPassword = lazyPage(chunks.loadResetPassword);

const PaymentRejectLazy = lazyImport(chunks.loadPaymentReject);
const PaymentSuccessLazy = lazyImport(chunks.loadPaymentSuccess);

// ——— User area ———
const Payment = lazyPage(chunks.loadPayment);
const MyVehiclePage = lazyPage(chunks.loadMyVehiclePage);
const UserAddVehiclePage = lazyPage(chunks.loadUserAddVehiclePage);
const MyCart = lazyPage(chunks.loadMyCart);
const Checkout = lazyPage(chunks.loadCheckout);
const UserProfile = lazyPage(chunks.loadUserProfile);
const UserSettings = lazyPage(chunks.loadUserSettings);
const UserOrders = lazyPage(chunks.loadUserOrders);
const MyPurchases = lazyPage(chunks.loadMyPurchases);

// ——— Dashboard ———
const DashboardHome = lazyPage(chunks.loadDashboardHome);
const AllOrders = lazyPage(chunks.loadAllOrders);
const CancelledOrders = lazyPage(chunks.loadCancelledOrders);
const PendingOrders = lazyPage(chunks.loadPendingOrders);
const OrderReports = lazyPage(chunks.loadOrderReports);
const CompletedOrders = lazyPage(chunks.loadCompletedOrders);
const AllProducts = lazyPage(chunks.loadAllProducts);
const AddProductsLazy = lazyImport(chunks.loadAddProducts);
const AllQR = lazyPage(chunks.loadAllQR);
const GenerateQR = lazyPage(chunks.loadGenerateQR);
const FinanceManagement = lazyPage(chunks.loadFinanceManagement);
const AllPackages = lazyPage(chunks.loadAllPackages);
const AddPackagesLazy = lazyImport(chunks.loadAddPackages);
const QrScanner = lazyPage(chunks.loadQrScanner);
const AddVehiclePage = lazyPage(chunks.loadAddVehiclePage);
const AssignVehiclePage = lazyPage(chunks.loadAssignVehiclePage);
const ScanAssignPage = lazyPage(chunks.loadScanAssignPage);
const AllVehiclePage = lazyPage(chunks.loadAllVehiclePage);
const AssignVehiclebyId = lazyPage(chunks.loadAssignVehiclebyId);
const UserManagementPageLazy = lazyImport(chunks.loadUserManagementPage);
const AddUserPageLazy = lazyImport(chunks.loadAddUserPage);
const AddProviderPageLazy = lazyImport(chunks.loadAddProviderPage);
const ReviewManagement = lazyPage(chunks.loadReviewManagement);
const ContactInbox = lazyPage(chunks.loadContactInbox);

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        Component: Home,
      },
      {
        path: "about",
        Component: About,
      },
      {
        path: "contact",
        Component: ContactPage,
      },
      {
        path: "product",
        Component: ProductPage,
      },
      {
        path: "Products/:id",
        element: <Navigate to="/product" replace />,
      },
      {
        path: "Products",
        Component: ProductShowcase,
      },
      {
        path: "qr-landing/:code",
        Component: QrLandingPage,
      },
      { path: "terms-of-use", Component: FooterStaticPage },
      { path: "privacy-policy", Component: FooterStaticPage },
      { path: "blog", Component: FooterStaticPage },
      { path: "business-terms", Component: FooterStaticPage },
      { path: "refund-policy", Component: FooterStaticPage },
      { path: "shipping-info", Component: FooterStaticPage },
      { path: "careers", Component: FooterStaticPage },
      { path: "partners", Component: FooterStaticPage },
      { path: "help-center", Component: FooterStaticPage },
      { path: "faq", Component: FooterStaticPage },
      { path: "documentation", Component: FooterStaticPage },
      { path: "community", Component: FooterStaticPage },
    ],
  },
  {
    path: "/",
    Component: AuthLayout,
    errorElement: <Error404 />,
    children: [
      {
        path: "login",
        Component: Login,
      },
      {
        path: "register",
        Component: Register,
      },
      {
        path: "forgotPassword",
        Component: ForgotPassword,
      },
      {
        path: "forgotPassword/enterCode",
        Component: EnterCode,
      },
      {
        path: "forgotPassword/resetPassword",
        Component: ResetPassword,
      },
      {
        path: "payment/failed",
        element: (
          <PrivateRoute>
            <Suspense fallback={<RouteFallback />}>
              <PaymentRejectLazy />
            </Suspense>
          </PrivateRoute>
        ),
      },
      {
        path: "payment/success",
        element: (
          <PrivateRoute>
            <Suspense fallback={<RouteFallback />}>
              <PaymentSuccessLazy />
            </Suspense>
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/user",
    element: (
      <PrivateRoute>
        <UserLayout />
      </PrivateRoute>
    ),
    errorElement: <Error404 />,
    children: [
      {
        path: "payment",
        Component: Payment,
      },
      {
        path: "my-vehiclePage",
        Component: MyVehiclePage,
      },
      {
        path: "user-add-vehicle",
        Component: UserAddVehiclePage,
      },
      {
        path: "my-cart",
        Component: MyCart,
      },
      {
        path: "checkout",
        Component: Checkout,
      },
      {
        path: "user-profile",
        Component: UserProfile,
      },
      {
        path: "user-settings",
        Component: UserSettings,
      },
      {
        path: "user-orders",
        Component: UserOrders,
      },
      {
        path: "my-purchases",
        Component: MyPurchases,
      },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <PrivateRoute allowedRoles={["admin", "provider"]}>
        <DashboardLayout />
      </PrivateRoute>
    ),
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        Component: DashboardHome,
      },
      {
        path: "all-products",
        Component: AllProducts,
      },
      {
        path: "add-product",
        element: (
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <AddProductsLazy />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: "all-packages",
        Component: AllPackages,
      },
      {
        path: "add-package",
        element: (
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <AddPackagesLazy />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: "all-orders",
        Component: AllOrders,
      },
      {
        path: "completed-orders",
        Component: CompletedOrders,
      },
      {
        path: "cancelled-orders",
        Component: CancelledOrders,
      },
      {
        path: "pending-orders",
        Component: PendingOrders,
      },
      {
        path: "order-reports",
        Component: OrderReports,
      },
      {
        path: "finance-management",
        Component: FinanceManagement,
      },
      {
        path: "all-qr",
        Component: AllQR,
      },
      {
        path: "generate-qr",
        Component: GenerateQR,
      },
      {
        path: "reviews",
        element: (
          <AdminRoute>
            <ReviewManagement />
          </AdminRoute>
        ),
      },
      {
        path: "contact-messages",
        element: (
          <AdminRoute>
            <ContactInbox />
          </AdminRoute>
        ),
      },
      {
        path: "qr-scanner",
        Component: QrScanner,
      },
      {
        path: "all-vehicles",
        Component: AllVehiclePage,
      },
      {
        path: "add-vehicle",
        Component: AddVehiclePage,
      },
      {
        path: "assign-vehicle",
        Component: AssignVehiclePage,
      },
      {
        path: "assign-vehicle/:code",
        Component: AssignVehiclebyId,
      },
      {
        path: "scan-assign-vehicle",
        Component: ScanAssignPage,
      },
      {
        path: "user-management",
        element: (
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <UserManagementPageLazy />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: "add-user",
        element: (
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <AddUserPageLazy />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: "add-provider",
        element: (
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <AddProviderPageLazy />
            </Suspense>
          </AdminRoute>
        ),
      },
    ],
  },
  {
    path: "*",
    Component: Error404,
  },
]);

export default router;
