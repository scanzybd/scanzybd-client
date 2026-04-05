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
