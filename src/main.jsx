import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n/config'
import './index.css'
import { SITE_TITLE } from './config/company'
import { RouterProvider } from "react-router/dom";
import router from './router/router';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthProvider from './contexts/AuthContext/AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from './contexts/CartContext/CartContext';

AOS.init();
document.title = SITE_TITLE;
const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <RouterProvider
          router={router}
        />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
