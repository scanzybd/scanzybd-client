import { createBrowserRouter } from "react-router";
import RootLayout from "../layouts/RootLayout";
import Home from "../pages/Home/Home/Home";
import AuthLayout from "../layouts/AuthLayout";
import Login from "../pages/Authentication/Login/Login";
import Register from "../pages/Authentication/Register/Register";
import ForgotPassword from '../pages/Authentication/ForgotPassword/ForgotPassword';
import EnterCode from '../pages/Authentication/ForgotPassword/EnterCode';
import ResetPassword from "../pages/Authentication/ForgotPassword/ResetPassword";
import Error404 from "../pages/ErrorSection/Error404";
import PrivetRoute from "../routes/PrivetRoute";
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
        path: 'qr-landing',
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
    ]
  },
  {
    path: "/user",
    element: <PrivetRoute>
      <UserLayout></UserLayout>
    </PrivetRoute>,
    errorElement: <Error404 />,
    children: [
      {
      path: 'my-vehiclePage',
      Component: MyVehiclePage,
      },
      {
        path: 'user-add-vehicle',
        Component: UserAddVehiclePage,
      }
      // Add user-specific routes here
    ] 



  },
  {

    path: '/dashboard',
    element: <PrivetRoute>
      <DashboardLayout></DashboardLayout>
    </PrivetRoute>,
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
        path: 'add-vehicle',
        Component: AddVehiclePage,
      },
      {
        path: 'assign-vehicle',
        Component: AssignVehiclePage,
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
