import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './theme';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { IdleTimeoutManager } from './components';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage, RegisterPage, DashboardPage } from './pages';
import { ProtectedLayout } from './layouts/ProtectedLayout';

export default function App() {
  return (
    <ErrorBoundary>
      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes with Layout */}
              <Route
                element={
                  <IdleTimeoutManager>
                    <ProtectedLayout />
                  </IdleTimeoutManager>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<DashboardPage />} />
                <Route path="/settings" element={<DashboardPage />} />
              </Route>

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            </AuthProvider>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </MantineProvider>
    </ErrorBoundary>
  );
}
