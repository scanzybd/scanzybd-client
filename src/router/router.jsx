import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import About from "../pages/Home/About/About";

import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import ForgotPassword from '../pages/Authentication/ForgotPassword/ForgotPassword';
import EnterCode from '../pages/Authentication/ForgotPassword/EnterCode';
import ResetPassword from "../pages/Authentication/ForgotPassword/ResetPassword";
import Error404 from "../pages/ErrorSection/Error404";
import PrivateRoute from "../routes/PrivetRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import DashboardHome from "../pages/Dashboard/DashboardHome/DashboardHome";
import AllOrders from "../pages/Dashboard/Order/AllOrders";
import CancelledOrders from "../pages/Dashboard/Order/CancelledOrders";
import PendingOrders from "../pages/Dashboard/Order/PendingOrders";
import OrderReports from "../pages/Dashboard/Order/OrderReports";

import CompletedOrders from "../pages/Dashboard/Order/CompletedOrders";
import AllProducts from "../pages/Dashboard/Product/AllProducts";
import AddProducts from "../pages/Dashboard/Product/AddProducts";
import AllQR from "../pages/Dashboard/QR/AllQR";
import GenerateQR from "../pages/Dashboard/QR/GenerateQR";
import FinanceManagement from "../pages/Dashboard/Finance/FinanceManagement";

import AllPackages from "../pages/Dashboard/Package/AllPackages";
import AddPackages from "../pages/Dashboard/Package/AddPackages";
import UserLayout from "../layouts/UserLayout";
import QrLandingPage from "../pages/Home/QrLanding/QrLandingPage";
import MyVehiclePage from "../pages/User/UserVehicle/MyVehiclePage";
import QrScanner from "../pages/Dashboard/QR/QrScanner";
import AddVehiclePage from "../pages/Dashboard/Vehicle/AddVehiclePage";
import AssignVehiclePage from "../pages/Dashboard/Vehicle/AssignVehiclePage";
import ScanAssignPage from "../pages/Dashboard/Vehicle/ScanAssignPage";
import UserAddVehiclePage from "../pages/User/UserVehicle/UserAddVehiclePage";
import Checkout from "../pages/Dashboard/Order/Checkout";
import MyCart from "../pages/User/Cart/MyCart";
import UserProfile from "../pages/User/Profile/UserProfile";
import UserSettings from "../pages/User/Settings/UserSettings";
import UserOrders from "../pages/User/UserOrders/UserOrders";
import AllVehiclePage from "../pages/Dashboard/Vehicle/AllVehiclePage";
import AssignVehiclebyId from "../pages/Dashboard/Vehicle/AssignVehiclebyId";
import PaymentReject from "../pages/Dashboard/Order/PaymentStatus/PaymentReject";
import PaymentSuccess from "../pages/Dashboard/Order/PaymentStatus/PaymentSuccess";
import ProductShowcase from "../pages/Home/ProductShowcase/ProductShowcase";
import ContactPage from "../pages/Home/Contact/ContactPage";
import Payment from "../pages/User/Payment/Payment";

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
        path: 'about',
        Component: About,

      },
      {
        path: 'contact',
        Component: ContactPage,
      },
      {
        path: 'Products',
        Component: ProductShowcase,

      },
      {
        path: 'qr-landing/:code',
        Component:QrLandingPage,
      },
    

    ]
  },
  {
    path: "/",
    Component: AuthLayout,
    errorElement: <Error404 />, // <-- Also handle errors in auth layout
    children: [
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'register',
        Component: Register,
      },
      {
        path: 'forgotPassword',
        Component: ForgotPassword,
      },
      
      {
        path: 'forgotPassword/enterCode',
        Component: EnterCode,
      },
      {
        path: 'forgotPassword/resetPassword',
        Component: ResetPassword,
      },
       {
  path: "payment/failed",
  element: (
    <PrivateRoute>
      <PaymentReject />
    </PrivateRoute>
  ),
},
{
  path: "payment/success",
  element: (
    <PrivateRoute>
      <PaymentSuccess />
    </PrivateRoute>
  ),
},
    ]
  },
  {
    path: "/user",
    element: <PrivateRoute>
      <UserLayout></UserLayout>
    </PrivateRoute>,
    errorElement: <Error404 />,
    children: [
      {
      path: 'payment',
      Component: Payment,
      },
      {
      path: 'my-vehiclePage',
      Component: MyVehiclePage,
      },
      {
        path: 'user-add-vehicle',
        Component: UserAddVehiclePage,
      },
      {
        path: 'my-cart',
        Component: MyCart,
      },
      {
        path: 'checkout',
        Component: Checkout,
      },
      {
        path: 'user-profile',
        Component: UserProfile,
      },
      {
        path: 'user-settings',
        Component: UserSettings,
      },
      {
        path: 'user-orders',
        Component: UserOrders,
      },
     

      // Add user-specific routes here
    ] 



  },
  {

    path: '/dashboard',
    element: <PrivateRoute allowedRoles={['admin', 'provider']}>
      <DashboardLayout></DashboardLayout>
    </PrivateRoute>,
    errorElement: <Error404 />,
    children: [
      {
        index: true,
        Component: DashboardHome,

      },

      //Products
      {
        path: 'all-products',
        Component: AllProducts,

      },
      { 
        path: 'add-product',
        Component: AddProducts,
      },

      //packages
      {
        path: 'all-packages',
        Component: AllPackages,
      },
      {
        path: 'add-package',
        Component: AddPackages,
      },

      //orders
      {
        path: 'all-orders',
        Component: AllOrders,

      },
      {
        path: 'completed-orders',
        Component: CompletedOrders,
      },
      {
        path: 'cancelled-orders',
        Component: CancelledOrders,
      },
      {
        path: 'pending-orders', 
        Component: PendingOrders  ,
      },
      {
        path: 'order-reports',
        Component: OrderReports,
      },  

      //finance management
      {
        path: 'finance-management',
        Component: FinanceManagement, 
      },
      

      //QR
      {
        path: 'all-qr',
        Component: AllQR,
      },
      {
        path: 'generate-qr',
        Component: GenerateQR,
      },
      {
        path: 'qr-scanner',
        Component: QrScanner,
      },

      //Vehicle
      
      {
        path: 'all-vehicles',
        Component: AllVehiclePage,
      },
      {
        path: 'add-vehicle',
        Component: AddVehiclePage,
      },
      {
        path: 'assign-vehicle',
        Component: AssignVehiclePage,
      },
      {
        path: 'assign-vehicle/:code',
        Component: AssignVehiclebyId,
      },
      {
        path: 'scan-assign-vehicle',
        Component: ScanAssignPage,
      }

    ]

  },

  // Optional: catch all unmatched routes outside layouts
  {
    path: "*",
    Component: Error404,
  },
]);

export default router;
