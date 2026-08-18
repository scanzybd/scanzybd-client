import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './i18n/config'
import './index.css'
import './styles/dashboard-dark.css'
import { RouterProvider } from "react-router/dom";
import router from './router/router';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AuthProvider from './contexts/AuthContext/AuthProvider';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { CartProvider } from './contexts/CartContext/CartContext';
import RoutePrefetch from './router/RoutePrefetch';
import { createAppPersister } from './lib/queryPersister';
import GlobalFetchingBar from './components/GlobalFetchingBar';
import { ThemeProvider } from './contexts/ThemeContext/ThemeContext';

AOS.init();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createAppPersister();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          maxAge: 1000 * 60 * 60 * 24,
          dehydrateOptions: {
            shouldDehydrateQuery: (q) =>
              q.state.status === 'success' && q.meta?.persist !== false,
          },
        }}
      >
        <GlobalFetchingBar />
        <CartProvider>
          <AuthProvider>
            <RoutePrefetch />
            <RouterProvider router={router} />
          </AuthProvider>
        </CartProvider>
      </PersistQueryClientProvider>
    </ThemeProvider>
    </HelmetProvider>
  </StrictMode>
);
