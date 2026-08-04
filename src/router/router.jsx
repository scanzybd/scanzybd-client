import { Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import RootLayout from "../layouts/RootLayout";
import AuthLayout from "../layouts/AuthLayout";
import Error404 from "../pages/ErrorSection/Error404";
import PrivateRoute from "../routes/PrivetRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import UserLayout from "../layouts/UserLayout";
import AdminRoute from "../routes/AdminRoute";
import ProviderRoute from "../routes/ProviderRoute";
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
const PaymentPendingLazy = lazyImport(chunks.loadPaymentPending);

// ——— User area ———
const Payment = lazyPage(chunks.loadPayment);
const MyVehiclePage = lazyPage(chunks.loadMyVehiclePage);
const MyCart = lazyPage(chunks.loadMyCart);
const Checkout = lazyPage(chunks.loadCheckout);
const UserProfile = lazyPage(chunks.loadUserProfile);
const UserSettings = lazyPage(chunks.loadUserSettings);
const UserOrders = lazyPage(chunks.loadUserOrders);
const MyPurchases = lazyPage(chunks.loadMyPurchases);

// ——— Dashboard ———
const DashboardHome = lazyPage(chunks.loadDashboardHome);
const AllProducts = lazyPage(chunks.loadAllProducts);
const AddProductsLazy = lazyImport(chunks.loadAddProducts);
const AllQR = lazyPage(chunks.loadAllQR);
const GenerateQR = lazyPage(chunks.loadGenerateQR);
const QrFrameSettings = lazyPage(chunks.loadQrFrameSettings);
const DashboardSettings = lazyPage(chunks.loadDashboardSettings);
const FinanceManagement = lazyPage(chunks.loadFinanceManagement);
const PaymentGatewaySettings = lazyPage(chunks.loadPaymentGatewaySettings);
const ProviderFinance = lazyPage(chunks.loadProviderFinance);
const ProviderDueList = lazyPage(chunks.loadProviderDueList);
const AllPackages = lazyPage(chunks.loadAllPackages);
const AddPackagesLazy = lazyImport(chunks.loadAddPackages);
const QrScanner = lazyPage(chunks.loadQrScanner);
const CreateOrderPage = lazyPage(chunks.loadCreateOrderPage);
const AssignVehiclePage = lazyPage(chunks.loadAssignVehiclePage);
const ScanAssignPage = lazyPage(chunks.loadScanAssignPage);
const AllVehiclePage = lazyPage(chunks.loadAllVehiclePage);
const AssignVehiclebyId = lazyPage(chunks.loadAssignVehiclebyId);
const UserManagementPageLazy = lazyImport(chunks.loadUserManagementPage);
const AddUserPageLazy = lazyImport(chunks.loadAddUserPage);
const AddProviderPageLazy = lazyImport(chunks.loadAddProviderPage);
const ReviewManagement = lazyPage(chunks.loadReviewManagement);
const ContactInbox = lazyPage(chunks.loadContactInbox);
const StaffOrdersPage = lazyPage(chunks.loadStaffOrders);
const UnpaidOrdersPage = lazyPage(chunks.loadUnpaidOrders);
const ConfirmedOrder = lazyPage(chunks.loadConfirmedOrder);
const OrderDetailPage = lazyPage(chunks.loadOrderDetail);

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
        Component: ProductPage,
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
      {
        path: "payment/pending",
        element: (
          <PrivateRoute>
            <Suspense fallback={<RouteFallback />}>
              <PaymentPendingLazy />
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
        element: <Navigate to="/user/my-vehiclePage" replace />,
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
        path: "my-orders",
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
        path: "settings",
        Component: DashboardSettings,
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
        path: "orders",
        Component: StaffOrdersPage,
      },
      {
        path: "unpaid-orders",
        element: (
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <UnpaidOrdersPage />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: "orders/:orderId",
        Component: OrderDetailPage,
      },
      {
        path: "all-orders",
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "confirmed-orders",
        element: (
          <AdminRoute>
            <Suspense fallback={<RouteFallback />}>
              <ConfirmedOrder />
            </Suspense>
          </AdminRoute>
        ),
      },
      {
        path: "completed-orders",
        element: <Navigate to="/dashboard/confirmed-orders" replace />,
      },
      {
        path: "shipped-orders",
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "delivered-orders",
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "returned-orders",
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "cancelled-orders",
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "pending-orders",
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "order-reports",
        element: <Navigate to="/dashboard/orders" replace />,
      },
      {
        path: "finance-management",
        element: (
          <AdminRoute>
            <FinanceManagement />
          </AdminRoute>
        ),
      },
      {
        path: "payment-gateways",
        element: (
          <AdminRoute>
            <PaymentGatewaySettings />
          </AdminRoute>
        ),
      },
      {
        path: "provider-due-list",
        element: (
          <AdminRoute>
            <ProviderDueList />
          </AdminRoute>
        ),
      },
      {
        path: "provider-finance",
        element: (
          <ProviderRoute>
            <ProviderFinance />
          </ProviderRoute>
        ),
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
        path: "qr-frame-settings",
        element: (
          <AdminRoute>
            <QrFrameSettings />
          </AdminRoute>
        ),
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
        path: "create-order",
        Component: CreateOrderPage,
      },
      {
        path: "add-vehicle",
        element: <Navigate to="/dashboard/create-order" replace />,
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
          <Suspense fallback={<RouteFallback />}>
            <AddUserPageLazy />
          </Suspense>
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
