import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import { UserLayout } from './layouts/UserLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { BusinessLayout } from './layouts/BusinessLayout';

// User Pages
import { HomePage } from './pages/user/HomePage';
import { SearchResultsPage } from './pages/user/SearchResultsPage';
import { BusinessDetailPage } from './pages/user/BusinessDetailPage';
import { ContactPage } from './pages/user/ContactPage';

// Auth Pages
import { AdminLoginPage } from './pages/auth/AdminLoginPage';
import { BusinessLoginPage } from './pages/auth/BusinessLoginPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminBusinessesPage } from './pages/admin/AdminBusinessesPage';
import { AdminCredentialsPage } from './pages/admin/AdminCredentialsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCollabPage } from './pages/admin/AdminCollabPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';

// Business Pages
import { BusinessDashboardPage } from './pages/business/BusinessDashboardPage';
import { BusinessProfilePage } from './pages/business/BusinessProfilePage';
import { BusinessRoomsPage } from './pages/business/BusinessRoomsPage';
import { BusinessFoodPage } from './pages/business/BusinessFoodPage';
import { BusinessAvailabilityPage } from './pages/business/BusinessAvailabilityPage';
import { BusinessMediaPage } from './pages/business/BusinessMediaPage';
import { BusinessLocationPage } from './pages/business/BusinessLocationPage';
import { BusinessSettingsPage } from './pages/business/BusinessSettingsPage';

// Route Guards & Common Pages
import { AdminRoute, BusinessRoute } from './routes/RouteGuards';
import { NotFoundPage } from './pages/common/NotFoundPage';
import { UnauthorizedPage } from './pages/common/UnauthorizedPage';
import { HelloKittyGameLoader } from './components/common/HelloKittyGameLoader';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <HelloKittyGameLoader />
            <Routes>
              {/* Traveler / Discovery Public Routes */}
              <Route path="/" element={<UserLayout />}>
                <Route index element={<HomePage />} />
                <Route path="search" element={<SearchResultsPage />} />
                <Route path="place/:businessId" element={<BusinessDetailPage />} />
                <Route path="hotel/:businessId" element={<BusinessDetailPage />} />
                <Route path="business/:businessId" element={<BusinessDetailPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Authentication Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/business/login" element={<BusinessLoginPage />} />

              {/* Platform Master Admin Portal */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="businesses" element={<AdminBusinessesPage />} />
                <Route path="credentials" element={<AdminCredentialsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="collabs" element={<AdminCollabPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
              </Route>

              {/* Business Operator Portal */}
              <Route
                path="/business"
                element={
                  <BusinessRoute>
                    <BusinessLayout />
                  </BusinessRoute>
                }
              >
                <Route index element={<Navigate to="/business/dashboard" replace />} />
                <Route path="dashboard" element={<BusinessDashboardPage />} />
                <Route path="profile" element={<BusinessProfilePage />} />
                <Route path="rooms" element={<BusinessRoomsPage />} />
                <Route path="food" element={<BusinessFoodPage />} />
                <Route path="availability" element={<BusinessAvailabilityPage />} />
                <Route path="media" element={<BusinessMediaPage />} />
                <Route path="location" element={<BusinessLocationPage />} />
                <Route path="settings" element={<BusinessSettingsPage />} />
              </Route>

              {/* Common Fallback Routes */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
